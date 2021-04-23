<style>
	.subtitles-app {
		position: relative;
	}
	.subtitles-app > :global(*) {
		z-index: 1000000000;
	}
</style>
<div class="subtitles-app">
	{#if phase === 'prompt'}
		<SubtitlePrompt on:subtitles-loaded={subtitlesLoaded} on:cancel={() => phase = 'cancelled'}/>
	{:else if phase === 'align'}
		<Align subtitles={subtitles} on:done={aligned} on:reselect={() => phase = 'prompt'}/>
	{:else if phase === 'play'}
		{#if $showSubtitlesOnVideo}
			{#if subtitles.format === 'subrip'}
				<SubRipRenderer
					format={subtitles.format}
					subtitles={subtitleStore}
				/>
			{:else if subtitles.format === 'ass'}
				<ASSRenderer
					format={subtitles.format}
					styles={subtitles.styles}
					subtitles={subtitleStore}
				/>
			{/if}
		{/if}
		<Tray
			{recentSubs}
			{subtitles}
			on:restart={restart}
			on:tray-pauser={trayPauser}
			on:realign={() => phase = 'align'}
		/>
	{:else if phase === 'cancelled'}
        <Tray mode="cancelled"
			on:restart={restart}
	    />
	{/if}
</div>

<Hotkeys />

<script>
	import {onMount} from 'svelte';
	import Tray from "./tray/Tray.svelte";
	import SubRipRenderer from './renderers/SubRipRenderer.svelte';
	import ASSRenderer from './renderers/ASSRenderer.svelte';
	import SubtitlePrompt from "./SubtitlePrompt.svelte";
	import Align from "./Align.svelte";
	import {showSubtitlesOnVideo, autoCopySubtitles} from "./settingsStore";
	import {
		showNameStore,
		alignmentStore
	} from './alignmentStore';
	import {createSubtitleTimer, setSubtitles as setTimerSubtitles} from "./subtitleTimer";
	import Hotkeys from "./Hotkeys.svelte";
	import {videoController} from "./VideoController";

	const alignmentKey = 'last-used-alignment';

	let phase = 'prompt',
		currentSubtitles = [],
		currentTime = '',
		subtitles = null,
		video = null,
		subOffset = -1,
		recentSubs = [],
		subtitleStore,
		subtitleUnsubscribe;

	alignmentStore.subscribe(val => subOffset = val);

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
		let lastSrc = '',
			lastTitle = '';
		setInterval(() => {
			//query the video each time, in case the video gets deleted and replaced
			const curSrc = document.querySelector('video').getAttribute('src');
			if (curSrc && curSrc !== lastSrc) {
				lastSrc = curSrc;
				restart();
			}
			//monitor for title changes, if it changes the adjustments will change, it depend
			//on the show name so it can remember the last alignment for different shows
			const titleElement = document.querySelector('.video-title'),
				videoTitle = titleElement ? titleElement.textContent : '';
			if (videoTitle !== lastTitle) {
				lastTitle = videoTitle;
				showNameStore.set(videoTitle);
			}
		}, 50);
	});

	function aligned() {
		video = document.querySelector('video');
		videoController.setVideo(video);
		recentSubs = [];
		phase = 'play';

		if (subtitleUnsubscribe) {
			subtitleUnsubscribe();
		}

		setTimerSubtitles(subtitles);
		subtitleStore = createSubtitleTimer(alignmentStore)
		let lastText = '';
		subtitleUnsubscribe = subtitleStore.subscribe(currentSubs => {
			mergeSubsWithRecent(currentSubs);

			const subText = currentSubs.map(sub => sub.text || '').join('\n').trim();
			if ($autoCopySubtitles && subText !== lastText && subText) {
				lastText = subText;
				GM_setClipboard(subText, 'text')
			}
		})
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

	function subtitlesLoaded(e) {
		subtitles = e.detail.subtitles;
		if (subtitles.subs.length === 0) {
			console.log('subtitles object failed to parse: ', subtitles);
			alert(`No subtitles were able to be parsed from the selected subtitle file, verify nothing is wrong with the file. If it appears normal please submit a bug report with the episode and the subtitles file you used to the issue tracker (a link can be found in the tray on the right side of the video player)!`);
			phase = 'cancelled';
		}
		else if (!e.detail.skipAlignment) {
			phase = 'align';
		}
		else {
			alignmentStore.set(0);
			aligned();
		}
	}

	function trayPauser(e) {
		e.detail ? videoController.addPauser('tray') : videoController.removePauser('tray');
	}
</script>