<style>
	video {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
	}
	.video-player.no-cursor {
		cursor: none;
	}
    .pause-alert-container {
		position: absolute;
		display: flex;
		flex-direction: column;
        height: 100%;
		justify-content: center;
		width: 100%;
	}
	.pause-alert {
		font-size: 8vh;
        background: #111218CC;
		color: white;
		border-radius: 0.2rem;
		padding: 2rem;
        margin: 0 auto;
		cursor: default;
		text-transform: uppercase;
	}
	.video-controls {
		background: rgba(28, 24, 37, 0.79);
		position: absolute;
		bottom: 0;
		color: white;
		width: 100%;
		font-size: 1rem;
		z-index: 100000;
	}
    .times {
		padding: 0.3rem;
		cursor: default;
	}
	.video-controls input[type=range] {
		flex: 1;
	}
    button {
		padding: 0 0em;
		line-height: 1.5;
        cursor: pointer;
		font-size: 2rem;
		width: 5rem;
		color: white;
	}
	input[type=range] {
		-webkit-appearance: none;
		background: none !important;
		width: 100%;
	}
	::-moz-range-track {
		background-color: #252732;
        height: 0.4rem;
	}

	::-moz-range-progress {
		background: var(--accent-gradient) fixed;
		height: 0.4rem;
	}

	::-moz-range-thumb {
		-webkit-appearance: none;
		cursor: pointer;
		height: 0.75rem;
		width: 0.75rem;
		background: var(--accent-gradient) fixed;
		border-radius: 50%;
		border: none;
		margin-top: -0.875rem;
        visibility: hidden;
	}

	/* chrome doesn't seem to play nicely with comma separated selectors, can't combine with the firefox ones */
	::-webkit-slider-runnable-track {
		background-color: #4b5266;
		height: 0.4rem;
	}

	::-webkit-slider-thumb {
		-webkit-appearance: none;
		cursor: pointer;
		height: 0.75rem;
		width: 0.75rem;
		background: var(--accent-gradient) fixed;
		border-radius: 50%;
		border: none;
		margin-top: -0.25rem;
	}
	.video-player :global(i) {
		font-size: 1.5rem;
	}
</style>

<div class="video-player" class:no-cursor={!showControls && !paused}>
	<video
		{src}
		bind:currentTime={currentTime}
		bind:duration={totalTime}
		bind:paused={paused}
		on:click={togglePause}
		bind:this={videoElement}
	></video>
	{#if paused}
		<div class="pause-alert-container" on:click={togglePause}>
			<p class="pause-alert">
				{#if src}
                    Paused
				{:else}
					Select a video
				{/if}
			</p>
		</div>
	{/if}
	{#if showControls || paused}
		<div class="video-controls f-row align-items-center" transition:fade={{duration: 100}}>
			<button on:click={togglePause}><Icon icon={!paused ? 'pause' : 'play'} /></button>
			<span class="times">
				{prettyTime(currentTime, totalTime > 3600)} / {prettyTime(totalTime)}
			</span>
			<input type="range" bind:value={currentTime} max={totalTime} />
			<button on:click={() => showSettings = !showSettings}>
				<Icon icon="cog" />
				<span class="sr-only">Video settings</span>
			</button>
			<button on:click={toggleFullscreen}>
				<Icon icon="expand" />
				<span class="sr-only">Toggle fullscreen</span>
			</button>
		</div>
	{/if}
</div>

{#if showSettings}
	<Modal bind:visible={showSettings} title="Video Settings">
		<SaiseiSettings on:switchVideo={switchVideo} videos={metadata.videos} {selectedVideoIndex} />
	</Modal>
{/if}

<svelte:window on:keydown={handleHotkeys} on:mousemove={active}/>

<script>
	import {fade} from 'svelte/transition';
	import {onMount, tick} from 'svelte';
	import {Icon, Modal} from 'sheodox-ui';
	import SaiseiSettings from "./SaiseiSettings.svelte";
	import viewTimes from "../view-times";

	export let metadata;
	export let resourceBase;

	//the amount of time to wait before fading out the video controls
	const inactivityTimeout = 3000;
	let currentTime = 0,
		showSettings = false,
		totalTime = 0,
		paused = true,
		showControls = true,
		selectedVideoIndex = 0;

	$: src = getSrc(selectedVideoIndex);

	function getSrc(metadataVideoIndex) {
		return `${resourceBase}/${metadata.videos[metadataVideoIndex].fileName}`
	}

	let inactiveTimer, videoElement;

	function active() {
		showControls = true;

		clearTimeout(inactiveTimer);
		inactiveTimer = setTimeout(() => {
			showControls = false;
		}, inactivityTimeout);
	}

	async function switchVideo(e) {
		const lastTime = currentTime,
			lastPaused = paused;
		//need to store the currentTime on the video so we can go back to there after switching it
		//otherwise the video will start from the beginning again
		selectedVideoIndex = e.detail;

		await tick();

		function resume() {
			currentTime = lastTime;
			if (!lastPaused) {
				videoElement.play();
			}

			videoElement.removeEventListener('canplay', resume)
		}
		videoElement.addEventListener('canplay', resume);
	}

	/**
	 * Change a number in seconds to mm:ss or hh:mm:ss
	 * @param seconds - number of seconds, not ms because video elements deal in seconds
	 * @param forcePadHours - if we should pad 00 for hours regardless of if the time is over an hour,
	 * if the duration of the video is over an hour the width of the times displayed will change once
	 * it surpasses that hour mark, causing the range element to change width, which could cause issues
	 * with seeking.
	 * @returns {string}
	 */
	function prettyTime(seconds, forcePadHours = false) {
		const hoursRemainder = seconds % 3600,
			hours = Math.floor((seconds / 3600)),
			minutesRemainder = hoursRemainder % 60,
			minutes = Math.floor(hoursRemainder / 60);
		const pad = num => num.toFixed(0).padStart(2, '0');
		return (hours > 0 || forcePadHours ? [hours, minutes, minutesRemainder] : [minutes, minutesRemainder])
			.map(pad).join(':');
	}

	function togglePause() {
		//don't let the video play if there's no video to play
		if (src) {
			paused = !paused;
			active();
		}
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
	}

	function handleHotkeys(e) {
		let caught = true;
		const smallTimeAdjustment = 5,
			largeTimeAdjustment = 15;

		switch (e.key) {
			case 'f':
				toggleFullscreen();
				break;
			//svelte seems to be unreliable when changing using currentTime binding, direct DOM usage seems to work better for the next few hotkeys
			case 'ArrowLeft':
				videoElement.currentTime -= smallTimeAdjustment;
				break;
			case 'ArrowRight':
				videoElement.currentTime += smallTimeAdjustment;
				break;
			case 'j':
				videoElement.currentTime -= largeTimeAdjustment;
				break;
			case 'l':
				videoElement.currentTime += largeTimeAdjustment;
				break;
			case ' ':
			case 'k':
				togglePause();
				break;
			default:
				caught = false;
		}
		if (caught) {
			e.preventDefault();
			e.stopPropagation();
		}
		active();
	}
	onMount(() => {
		// the full path to this video
		const videoIdentifier = resourceBase + '/' + metadata.name;

		currentTime = viewTimes.get(videoIdentifier).currentTime;
		setInterval(() => {
			const video = document.querySelector('video');
			if (video) {
				viewTimes.set(videoIdentifier, video.currentTime, video.duration)
			}
		}, 50);
	})
</script>