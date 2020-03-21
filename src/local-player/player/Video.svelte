<style>
	video {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
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
	}
	.video-controls {
		display: flex;
		flex-direction: row;
		background: rgba(28, 24, 37, 0.79);
		position: absolute;
		bottom: 0;
		color: white;
		width: 100%;
		font-size: 1rem;
	}
    .times {
		padding: 0.3rem;
		line-height: 2rem;
		cursor: default;
	}
	.video-controls input[type=range] {
		flex: 1;
	}
    button {
		color: white;
		background: none;
		border: none;
		padding: 0 0.6rem;
		line-height: 1.5;
        cursor: pointer;
		font-size: 2rem;
	}
    button:active {
		border: none;
	}
	button:focus {
		box-shadow: -1px -1px #42d1f2, 1px -1px #42d1f2;
	}
	button::-moz-focus-inner {
		border: 0;
	}
	button:hover {
		background: #344062;
		color: #42d1f2;
	}

	input[type=range] {
		-webkit-appearance: none;
		background: none !important;
		width: 100%;
	}
	::-moz-range-track {
		background-color: #4b5266;
		height: 0.2rem;
	}

	::-moz-range-progress {
		background-color: #ffdd00;
	}

	::-moz-range-thumb {
		-webkit-appearance: none;
		cursor: pointer;
		height: 0.75rem;
		width: 0.75rem;
		background: #ffdd00;
		border-radius: 50%;
		border: none;
		margin-top: -0.875rem;
	}

	/* chrome doesn't seem to play nicely with comma separated selectors, can't combine with the firefox ones */
	::-webkit-slider-runnable-track {
		background-color: #4b5266;
		height: 0.2rem;
	}

	::-webkit-slider-thumb {
		-webkit-appearance: none;
		cursor: pointer;
		height: 0.75rem;
		width: 0.75rem;
		background: #ffdd00;
		border-radius: 50%;
		border: none;
		margin-top: -0.25rem;
	}
</style>

<div class="video-player">
	<video src={src} bind:currentTime={currentTime} bind:duration={totalTime} bind:paused={paused} on:click={togglePause}></video>
	{#if paused}
		<div class="pause-alert-container" on:click={togglePause}>
			<p class="pause-alert">Paused</p>
		</div>
	{/if}
	{#if showControls || paused}
		<div class="video-controls" transition:fade={{duration: 100}}>
			<button on:click={togglePause}><Icon name={!paused ? 'pause' : 'play'} /></button>
			<span class="times">
				{prettyTime(currentTime)} / {prettyTime(totalTime)}
			</span>
			<input type="range" bind:value={currentTime} max={totalTime} />
			<button on:click={toggleFullscreen}><Icon name="maximize-2" /></button>
		</div>
	{/if}
</div>

<svelte:window on:keydown={handleHotkeys} on:mousemove={active}/>

<script>
	import {fade} from 'svelte/transition';
	import Icon from "../Icon.svelte";

	export let src = '';
	//the amount of time to wait before fading out the video controls
	const inactivityTimeout = 3000;
	let currentTime = 0,
			totalTime = 0,
			paused = true,
			showControls = true;

	let inactiveTimer;

	function active() {
		showControls = true;

		clearTimeout(inactiveTimer);
		inactiveTimer = setTimeout(() => {
			showControls = false;
		}, inactivityTimeout);
	}

	function prettyTime(seconds) {
		const hoursRemainder = seconds % 3600,
				hours = Math.floor((seconds / 3600)),
				minutesRemainder = hoursRemainder % 60,
				minutes = Math.floor(hoursRemainder / 60);
		const pad = num => num.toFixed(0).padStart(2, '0');
		return (hours > 0 ? [hours, minutes, minutesRemainder] : [minutes, minutesRemainder])
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
			case 'ArrowLeft':
				currentTime -= smallTimeAdjustment;
				break;
			case 'ArrowRight':
				currentTime += smallTimeAdjustment;
				break;
			case 'j':
				currentTime -= largeTimeAdjustment;
				break;
			case 'l':
				currentTime += largeTimeAdjustment;
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
</script>