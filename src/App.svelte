<style>
	.subtitles-app {
		position: relative;
	}
	.subtitles-app > :global(*) {
		z-index: 1000000000;
	}
	.subtitles-app :global(button) {
		background: #fd0;
		border: none;
		cursor: pointer;
		padding: 10px;
		line-height: 1;
		font-weight: bold;
		color: black;
		text-transform: uppercase;
	}
	.subtitles-app :global(button:hover) {
		background: #ffea6d;
	}
	.alignment-buttons {
		display: flex;
		flex-direction: column;
	}
	.alignment-buttons button {
		margin: 0.5rem;
		align-self: center;
	}
</style>
<div class="subtitles-app">
	{#if phase === 'prompt'}
		<SRTPrompt on:srt-loaded={srtLoaded}/>
	{:else if phase === 'align'}
		<div class="alignment-buttons">
			<button on:click={align}>
				Click when the first line is said:
				<br />
				<pre>{srt.subs[0].text}</pre>
			</button>
			{#if typeof lastAlignment === 'number'}
				<button on:click={useLastAlignment}>
					Use the last alignment (first line at {(lastAlignment / 1000).toFixed(1)} seconds).
				</button>
			{/if}
		</div>
	{:else if phase === 'play'}
		<Subtitles current={currentSubtitles} currentTime={currentTime} visible={showSubs} on:define-pauser={definePauser}/>
		<Tray recentSubs={recentSubs} on:restart={restart} on:tray-pauser={trayPauser} on:define-pauser={definePauser} on:realign={() => phase = 'align'} on:show-subs={e => showSubs = e.detail} />
	{/if}
</div>

<script>
    import {onMount} from 'svelte';
	import SRT from './SRT';
	import SRTPrompt from './SRTPrompt.svelte';
	import Tray from "./Tray.svelte";
	import Subtitles from "./Subtitles.svelte";
	import VideoController from './VideoController';

	const alignmentKey = 'last-used-alignment',
		lastAlignment = GM_getValue(alignmentKey),
		videoController = new VideoController();

	let phase = 'prompt',
		currentSubtitles = [],
		currentTime = '',
		srt = null,
		video = null,
		subOffset = -1,
		recentSubs = [],
		showSubs = true;

	function restart() {
		recentSubs = [];
		currentSubtitles = [];
		phase = 'prompt';
	}

	onMount(() => {
		document.addEventListener('visibilitychange', () => {
			if (!document.hidden) {
				videoController.removePauser('define');
			}
		})
	});

	function align(alignment) {
		video = document.querySelector('video');
		videoController.setVideo(video);
		//assume decent reaction time, subtract by a bit so they don't have to perfectly predict
		subOffset = typeof alignment === 'number' ? alignment : video.currentTime * 1000 - srt.subs[0].start - 400;
		GM_setValue(alignmentKey, subOffset);
		phase = 'play';
		filterCurrentSubtitles();
	}
	function useLastAlignment() {
		align(lastAlignment);
	}

	function mergeSubsWithRecent(subs) {
		let newestSub = subs[subs.length - 1],
			mostRecent = recentSubs[recentSubs.length - 1];
		if (!mostRecent || newestSub && newestSub.text !== mostRecent.text) {
			recentSubs = [...recentSubs, newestSub];
		}
		if (recentSubs.length > 10) {
			recentSubs = recentSubs.slice(recentSubs.length - 10);
		}
	}

	function filterCurrentSubtitles() {
		currentSubtitles = srt.getSubs(video.currentTime * 1000 - subOffset);
		mergeSubsWithRecent(currentSubtitles);
		requestAnimationFrame(filterCurrentSubtitles);
	}

	function srtLoaded(e) {
		srt = new SRT(e.detail);
		phase = 'align';
	}

	function trayPauser(e) {
		e.detail ? videoController.addPauser('tray')  : videoController.removePauser('tray');
	}

	function definePauser() {
		videoController.addPauser('define');
	}
</script>