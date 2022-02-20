<svelte:window on:keydown={handleHotkey} />

<script lang="ts">
	import { Readable, get } from 'svelte/store';
	import { performSubtitleClickAction } from './renderers/render-common';
	import { invertVerticalAlignment, showSubtitlesOnVideo } from './stores/settings';
	import { Subtitle } from './types/subtitles';

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
		}
	}
</script>
