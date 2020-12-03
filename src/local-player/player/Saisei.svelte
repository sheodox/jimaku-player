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
		padding: 0 0;
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
		src={streamer.src}
		bind:currentTime={currentTime}
		bind:duration={totalTime}
		bind:paused={paused}
		on:click={togglePause}
		on:error={videoError}
		bind:this={videoElement}
	></video>
	{#if paused}
		<div class="pause-alert-container" on:click={togglePause}>
			<p class="pause-alert">
				Paused
			</p>
		</div>
	{/if}
	{#if showControls || paused}
		<div class="video-controls f-row align-items-center" transition:fade={{duration: 100}}>
			<button on:click={togglePause}><Icon icon={!paused ? 'pause' : 'play'} /></button>
			<span class="times">
				{prettyTime(currentTime, totalTime > 3600)} / {prettyTime(totalTime)}
			</span>
			<input type="range" bind:value={currentTime} max={totalTime} aria-label="video time seek bar" />
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

<svelte:window on:keydown={handleHotkeys} on:mousemove={active} />
<svelte:body on:mouseleave={inactive} />

<script>
	import {fade} from 'svelte/transition';
	import {onMount, tick} from 'svelte';
	import {Icon, Modal} from 'sheodox-ui';
	import SaiseiSettings from "./SaiseiSettings.svelte";
	import viewTimes from "../view-times";
	import {Streamer} from './Streamer';
	import {isEnoughBuffered, isTimeBuffered, prettyTime} from "../utils";
	import {Logger, logLevels} from '../logger';

	export let metadata;
	export let resourceBase;

	//the amount of time to wait before fading out the video controls
	const inactivityTimeout = 3000,
		streamer = new Streamer(metadata, resourceBase),
		logger = new Logger('Saisei');
	let currentTime = 0,
		showSettings = false,
		totalTime = 0,
		paused = true,
		showControls = true,
		selectedVideoIndex = 0;

	let inactiveTimer, videoElement;

	function active() {
		showControls = true;

		clearTimeout(inactiveTimer);
		inactiveTimer = setTimeout(() => {
			showControls = false;
		}, inactivityTimeout);
	}

	// can be used to immediately consider the user inactive (mouse leave from the player)
	function inactive() {
		clearTimeout(inactiveTimer);
		showControls = false;
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

	function togglePause() {
		paused = !paused;
		active();
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

	$: {
		if (
			//this will run before the video initializes, without this it will always throw an error
			videoElement &&
			//ensure some amount of video is buffered beyond the current time, otherwise we should buffer
			//some video before we get there so they don't have to watch a stalled video
			!isEnoughBuffered(currentTime, videoElement.buffered)
		) {
			bufferVideo(currentTime);
		}
	}

	function isVideoBuffered(seconds) {
		if (!videoElement) {
			return;
		}

		return isTimeBuffered(seconds, videoElement.buffered);
	}

	async function bufferVideo(time) {
		await streamer.fetchSegment(time);

		if (logLevels.streaming && videoElement) {
			const bufferedTime = [];
			for (let i = 0; i < videoElement.buffered.length; i++) {
				const start = videoElement.buffered.start(i),
					end = videoElement.buffered.end(i);
				bufferedTime.push(`${prettyTime(start)}-${prettyTime(end)}`);
			}
			logger.streaming(`Buffered segments: ${bufferedTime.join(', ')}`)
			if (!isVideoBuffered(time)) {
				logger.streaming(`Attempted to buffer video for ${prettyTime(time)} but it is NOT buffered!`);
			}
		}
	}

	function videoError(...args) {
		logger.error(...args);
	}
	onMount(() => {
		// the full path to this video
		const videoIdentifier = resourceBase + '/' + metadata.name;

		currentTime = viewTimes.get(videoIdentifier).currentTime;
		bufferVideo(currentTime);

		setInterval(() => {
			const video = document.querySelector('video');
			if (video) {
				viewTimes.set(videoIdentifier, video.currentTime, video.duration)
			}
		}, 50);
	})
</script>