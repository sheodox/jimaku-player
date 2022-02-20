<style>
	.subtitles-app {
		position: relative;
		/* don't let the subtitler itself steal clicks from pausing the video */
		pointer-events: none;
	}
	.subtitles-app > :global(*) {
		z-index: 1000000000;
		pointer-events: auto;
	}
</style>

<div class="subtitles-app">
	{#if phase === 'prompt'}
		<SubtitlePrompt on:subtitles-loaded={subtitlesLoaded} on:cancel={() => (phase = 'cancelled')} />
	{:else if phase === 'align'}
		<Align subtitles={parsedSubtitles} on:done={aligned} on:reselect={() => (phase = 'prompt')} />
	{:else if phase === 'play'}
		{#if $showSubtitlesOnVideo}
			{#if parsedSubtitles.format === 'subrip'}
				<SubRipRenderer subtitles={asSubRip(subtitleStore)} />
			{:else if parsedSubtitles.format === 'ass'}
				<ASSRenderer
					styles={parsedSubtitles.styles}
					subtitleParser={parsedSubtitles}
					subtitles={asASS(subtitleStore)}
				/>
			{/if}
		{/if}
		<Tray
			{recentSubs}
			subtitleParser={parsedSubtitles}
			on:restart={restart}
			on:tray-pauser={trayPauser}
			on:realign={() => (phase = 'align')}
		/>
	{:else if phase === 'cancelled'}
		<Tray mode="cancelled" on:restart={restart} />
	{/if}
	<Toasts />
</div>

<Hotkeys {subtitleStore} />

<script lang="ts">
	import { onMount } from 'svelte';
	import Tray from './tray/Tray.svelte';
	import SubRipRenderer from './renderers/SubRipRenderer.svelte';
	import ASSRenderer from './renderers/ASSRenderer.svelte';
	import SubtitlePrompt from './SubtitlePrompt.svelte';
	import Toasts from './Toasts.svelte';
	import Align from './Align.svelte';
	import { showSubtitlesOnVideo, autoCopySubtitles } from './stores/settings';
	import { showNameStore, alignmentStore } from './stores/alignment';
	import { createSubtitleTimer, setSubtitles as setTimerSubtitles } from './stores/subtitle-timer';
	import Hotkeys from './Hotkeys.svelte';
	import { videoController } from './video-controller';
	import type { Unsubscriber, Readable } from 'svelte/store';
	import { Subtitle, SubtitleParser } from './types/subtitles';
	import { SubRipSubtitle } from './parsers/SubRip';
	import { ASSSubtitle } from './parsers/ASS';

	let phase = 'prompt',
		parsedSubtitles: SubtitleParser = null,
		video = null,
		recentSubs: Subtitle[] = [],
		subtitleStore: ReturnType<typeof createSubtitleTimer>,
		subtitleUnsubscribe: Unsubscriber;

	function restart() {
		phase = 'prompt';
		parsedSubtitles = null;
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
			const curSrc = document.querySelector('video')?.getAttribute('src');
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

		setTimerSubtitles(parsedSubtitles);
		subtitleStore = createSubtitleTimer(alignmentStore);
		let lastText = '';
		subtitleUnsubscribe = subtitleStore.subscribe((currentSubs) => {
			mergeSubsWithRecent(currentSubs);

			const subText = currentSubs
				.map((sub) => sub.text || '')
				.join('\n')
				.trim();
			if ($autoCopySubtitles && subText !== lastText && subText) {
				lastText = subText;
				// this is an API provided by Tampermonkey that eslint doesn't know about
				// eslint-disable-next-line no-undef
				GM_setClipboard(subText, 'text');
			}
		});
	}

	function mergeSubsWithRecent(subs: Subtitle[]) {
		const interestingSubs = subs.filter((sub) => !!sub.text),
			newSubs = [];

		for (const sub of interestingSubs) {
			if (recentSubs.every((s) => s._id !== sub._id)) {
				newSubs.push(sub);
			}
		}

		recentSubs = [...newSubs, ...recentSubs].slice(0, 10);
	}

	function subtitlesLoaded(e: CustomEvent<{ subtitles: SubtitleParser; skipAlignment: boolean }>) {
		parsedSubtitles = e.detail.subtitles;
		if (parsedSubtitles.subs.length === 0) {
			console.log('subtitles object failed to parse: ', parsedSubtitles);
			alert(
				`No subtitles were able to be parsed from the selected subtitle file. Please submit a bug report with the episode and the subtitles file you used to the issue tracker (a link can be found in the tray on the right side of the video player)!`
			);
			phase = 'cancelled';
		} else if (!e.detail.skipAlignment) {
			phase = 'align';
		} else {
			alignmentStore.set(0);
			aligned();
		}
	}

	function trayPauser(e: CustomEvent<any>) {
		e.detail ? videoController.addPauser('tray') : videoController.removePauser('tray');
	}

	// can't cast the subtitle store as the individual subtitle formats in the template, this is a workaround
	function asSubRip(store: any) {
		return store as Readable<SubRipSubtitle[]>;
	}
	// can't cast the subtitle store as the individual subtitle formats in the template, this is a workaround
	function asASS(store: any) {
		return store as Readable<ASSSubtitle[]>;
	}
</script>
