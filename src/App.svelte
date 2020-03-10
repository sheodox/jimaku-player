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
		padding: 10px;
		line-height: 1;
		font-weight: bold;
		color: black;
		text-transform: uppercase;
		font-size: 0.9rem;
	}
	.subtitles-app :global(.small-button) {
		font-size: 0.6rem;
	}
	.subtitles-app :global(button:disabled) {
		background: #2a3450;

	}
	.subtitles-app :global(button:not(:disabled):hover) {
		background: #ffea6d;
		cursor: pointer;
	}
</style>
<div class="subtitles-app">
	{#if phase === 'prompt'}
		<SubtitlePrompt on:subtitles-loaded={subtitlesLoaded} on:cancel={() => phase = 'cancelled'}/>
	{:else if phase === 'align'}
		<Align firstSubtitle={subtitles.firstSubtitle()} on:set-align={align} on:reselect={() => phase = 'prompt'}/>
	{:else if phase === 'play'}
		<Subtitles format={subtitles.format} styles={subtitles.styles} current={currentSubtitles} currentTime={currentTime} visible={showSubs} on:define-pauser={definePauser}/>
		<Tray
				recentSubs={recentSubs}
				subtitles={subtitles}
				alignment={subOffset}
				on:restart={restart}
				on:tray-pauser={trayPauser}
				on:define-pauser={definePauser}
				on:realign={() => phase = 'align'}
				on:show-subs={e => showSubs = e.detail}
		/>
	{/if}
</div>

<script>
	import {onMount} from 'svelte';
	import Tray from "./Tray.svelte";
	import Subtitles from "./Subtitles.svelte";
	import VideoController from './VideoController';
	import SubtitlePrompt from "./SubtitlePrompt.svelte";
	import Align from "./Align.svelte";

	const alignmentKey = 'last-used-alignment',
		videoController = new VideoController();

	let phase = 'prompt',
		currentSubtitles = [],
		currentTime = '',
		subtitles = null,
		video = null,
		subOffset = -1,
		recentSubs = [],
		showSubs = true;

	function restart() {
		phase = 'prompt';
		subtitles = null;
		currentSubtitles = [];
	}

	onMount(() => {
		document.addEventListener('visibilitychange', () => {
			if (!document.hidden) {
				videoController.removePauser('define');
			}
		});

		//poll for video changes, and restart the sub process if a different video is selected
		let lastSrc = '';
		setInterval(() => {
			//query the video each time, in case the video gets deleted and replaced
			const curSrc = document.querySelector('video').getAttribute('src');
			if (curSrc && curSrc !== lastSrc) {
				lastSrc = curSrc;
				restart();
			}
		}, 50);
	});

	function align(e) {
		video = document.querySelector('video');
		videoController.setVideo(video);
		subOffset = e.detail;
		recentSubs = [];
		phase = 'play';
		renderSubs();
	}

	function mergeSubsWithRecent(subs) {
		let newestSub = subs[subs.length - 1],
			mostRecent = recentSubs[recentSubs.length - 1];
		if (newestSub && (!mostRecent || newestSub.text !== mostRecent.text)) {
			recentSubs = [...recentSubs, newestSub];
		}
		if (recentSubs.length > 10) {
			recentSubs = recentSubs.slice(recentSubs.length - 10);
		}
	}

	function renderSubs() {
		if (phase === 'play') {
			currentSubtitles = subtitles.getSubs(video.currentTime * 1000 - subOffset);
			mergeSubsWithRecent(currentSubtitles);
			requestAnimationFrame(renderSubs);
		}
	}

	function subtitlesLoaded(e) {
		subtitles = e.detail;
		if (subtitles.subs.length === 0) {
			console.log('subtitles object failed to parse: ', subtitles);
			alert(`No subtitles were parsed from the selected .${subtitles.format} file, verify nothing is wrong with the file. If it appears normal please submit a bug report with the episode and the subtitles file you used to the issue tracker!`);
		} else {
			phase = 'align';
		}
	}

	function trayPauser(e) {
		e.detail ? videoController.addPauser('tray') : videoController.removePauser('tray');
	}

	function definePauser() {
		videoController.addPauser('define');
	}
</script>