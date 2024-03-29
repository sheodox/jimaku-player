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
		background: #111218cc;
		color: white;
		border-radius: 0.2rem;
		padding: 2rem;
		margin: 0 auto;
		cursor: default;
		text-transform: uppercase;
		user-select: none;
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
		user-select: none;
	}
	button {
		cursor: pointer;
		font-size: 2rem;
		width: 5rem;
		color: white;
		flex: 0;
		margin: 0;
		padding: 0.5rem;
	}
	.video-player button {
		font-size: 1.5rem;
	}
</style>

<div class="video-player" class:no-cursor={!showControls && !paused}>
	<!-- svelte-ignore a11y-media-has-caption -->
	<video
		src={isDash ? streamer.src : `${selectedVideo.path}.mp4`}
		bind:currentTime
		bind:duration={totalTime}
		bind:paused
		on:click={togglePause}
		on:error={videoError}
		bind:this={videoElement}
	/>
	{#if paused}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="pause-alert-container" on:click={togglePause}>
			<p class="pause-alert">Paused</p>
		</div>
	{/if}
	{#if showControls || paused}
		<div class="video-controls f-row align-items-center" transition:fade={{ duration: 100 }}>
			<button on:click={togglePause}><Icon icon={!paused ? 'pause' : 'play'} variant="icon-only" /></button>
			<span class="times">
				{prettyTime(currentTime, totalTime > 3600)} / {prettyTime(totalTime)}
			</span>
			<SaiseiSeek
				value={currentTime}
				max={totalTime}
				on:seek={onSeeked}
				on:seek-drag-start={onSeekStart}
				label="video seek slider"
			/>
			{#if isDash}
				<button
					on:click={() => (showSettings = !showSettings)}
					on:contextmenu|preventDefault={() => (showDebug = true)}
				>
					<Icon icon="cog" variant="icon-only" />
					<span class="sr-only">Video settings</span>
				</button>
			{/if}
			<button on:click={toggleFullscreen}>
				<Icon icon="expand" variant="icon-only" />
				<span class="sr-only">Toggle fullscreen</span>
			</button>
		</div>
	{/if}
</div>

{#if showSettings}
	<Modal bind:visible={showSettings} title="Video Settings">
		<SaiseiSettings on:switchTrack={switchTrack} audioTracks={manifest.audio} {selectedAudioTrackIndex} />
	</Modal>
{/if}
{#if showDebug}
	<Modal bind:visible={showDebug} title="Saisei Debug">
		<SaiseiDebug metadata={manifest} />
	</Modal>
{/if}

<svelte:window on:keydown={handleHotkeys} on:mousemove={active} />
<svelte:body on:mouseleave={inactive} />

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Icon, Modal } from 'sheodox-ui';
	import SaiseiSettings from './SaiseiSettings.svelte';
	import viewTimes from '../view-times';
	import { Streamer } from './Streamer';
	import { isTimeBuffered, prettyTime } from '../utils';
	import { Logger, logLevels } from '../logger';
	import SaiseiSeek from './SaiseiSeek.svelte';
	import SaiseiDebug from './SaiseiDebug.svelte';
	import type { ManifestFile, VideoMetadata } from '../../../shared/types/videos';

	export let selectedVideo: VideoMetadata;
	export let resourceBase: string;
	export let manifest: ManifestFile;

	const isDash = selectedVideo.type === 'dash',
		//the amount of time to wait before fading out the video controls
		inactivityTimeout = 3000,
		streamer = new Streamer(manifest, resourceBase),
		logger = new Logger('Saisei');

	let currentTime = 0,
		showDebug = false,
		showSettings = false,
		totalTime = 0,
		paused = true,
		showControls = true,
		selectedAudioTrackIndex = isDash ? streamer.getSelectedAudioTrackIndex() : null;

	let inactiveTimer: ReturnType<typeof setTimeout>, videoElement: HTMLVideoElement;

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

	async function switchTrack(e: CustomEvent<number>) {
		selectedAudioTrackIndex = e.detail;
		streamer.switchAudioTrack(selectedAudioTrackIndex, currentTime);
	}

	function togglePause() {
		paused = !paused;
		active();
	}

	//track the state of paused when seeking starts,
	let wasPaused: boolean = null;
	function onSeekStart() {
		wasPaused = paused;
		//pause the video, or the slider will be jumping back and forth between
		//the intermediate values the user is dragging the thumb to, and the
		//actual values the video is playing, we'll resume the video (if it was
		//playing) when they finish seeking
		if (!paused) {
			paused = true;
		}
	}

	function onSeeked(e: CustomEvent<number>) {
		videoElement.currentTime = e.detail;
		// only care about unpausing the video if we programmatically paused it in the first place
		if (wasPaused !== null) {
			paused = wasPaused;
		}
		wasPaused = null;
		bufferVideo(e.detail);
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
	}

	function handleHotkeys(e: KeyboardEvent) {
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

	/*
	This interval ensures we have a decent amount of video and audio buffered so the video can play
	without interruptions. This could be in a reactive ("$: ...") statement, but that causes a crazy
	amount of unwanted segment fetches to happen if the user is dragging the seek bar. An interval
	like this will still always allow it to keep the buffer healthy before it would cause stalling.
	 */
	setInterval(() => {
		//this will run before the video initializes, without this it will always throw an error
		if (videoElement) {
			bufferVideo(currentTime);
		}
	}, 1000);

	function isVideoBuffered(seconds: number) {
		if (!videoElement) {
			return;
		}

		return isTimeBuffered(seconds, videoElement.buffered);
	}

	async function bufferVideo(seconds: number) {
		if (!isDash) {
			return;
		}

		const bufferingHappened = await streamer.bufferTime(seconds);

		if (bufferingHappened && logLevels.streaming && videoElement) {
			const bufferedTime = [];
			for (let i = 0; i < videoElement.buffered.length; i++) {
				const start = videoElement.buffered.start(i),
					end = videoElement.buffered.end(i);
				bufferedTime.push(`${prettyTime(start)}-${prettyTime(end)}`);
			}
			logger.streaming(`Buffered segments: ${bufferedTime.join(', ')}`);
			if (!isVideoBuffered(seconds)) {
				logger.streaming(`Attempted to buffer video for ${prettyTime(seconds)} but it is NOT buffered!`);
			}
		}
	}

	function videoError(...args: any[]) {
		logger.error(...args);
	}

	onMount(() => {
		// the full path to this video
		const videoIdentifier = resourceBase + '/' + (manifest?.title || selectedVideo.path);

		currentTime = viewTimes.get(videoIdentifier).currentTime;
		bufferVideo(currentTime);

		setInterval(() => {
			const video = document.querySelector('video');
			if (video) {
				viewTimes.set(videoIdentifier, video.currentTime, video.duration);
			}
		}, 50);
	});
</script>
