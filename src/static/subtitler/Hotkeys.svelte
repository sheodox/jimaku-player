<svelte:window on:keydown={handleHotkey} />

<script lang="ts">
	import { Readable, get } from 'svelte/store';
	import { performSubtitleClickAction } from './renderers/render-common';
	import { adjustAlignmentInPlace, COARSE_ADJUST_AMOUNT_MS, FINE_ADJUST_AMOUNT_MS } from './stores/alignment';
	import { invertVerticalAlignment, showSubtitlesOnVideo } from './stores/settings';
	import { subtitleHistory } from './stores/subtitle-timer';
	import { Subtitle } from './types/subtitles';
	import { rewindToSubtitle } from './video-controller';

	export let subtitleStore: Readable<Subtitle[]>;

	function handleHotkey(e: KeyboardEvent) {
		const tag = document.activeElement.tagName.toLowerCase();
		if (['textarea', 'input'].includes(tag)) {
			return;
		}

		const key = e.key.toLowerCase();
		if (key === 'h') {
			showSubtitlesOnVideo.update((show) => !show);
		} else if (key === 'i') {
			invertVerticalAlignment.update((invert) => !invert);
		} else if (key === 'a') {
			performSubtitleClickAction(get(subtitleStore).map((sub) => sub.text));
		} else if (key === 'z') {
			adjustAlignmentInPlace(e.shiftKey ? COARSE_ADJUST_AMOUNT_MS : FINE_ADJUST_AMOUNT_MS);
		} else if (key === 'x') {
			adjustAlignmentInPlace(-1 * (e.shiftKey ? COARSE_ADJUST_AMOUNT_MS : FINE_ADJUST_AMOUNT_MS));
		} else if (key === 'b') {
			const recent = $subtitleHistory;
			if (recent[0]) {
				rewindToSubtitle(recent[0].start);
			}
		}
	}
</script>
