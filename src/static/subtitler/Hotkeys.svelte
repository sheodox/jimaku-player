<svelte:window on:keydown={handleHotkey} />

<script lang="ts">
	import { invertVerticalAlignment, showSubtitlesOnVideo } from './stores/settings';

	function handleHotkey(e: KeyboardEvent) {
		const key = e.key.toLowerCase();
		if (key === 'h') {
			showSubtitlesOnVideo.update((show) => !show);
		} else if (key === 'i') {
			invertVerticalAlignment.update((invert) => !invert);
		}
	}
</script>
