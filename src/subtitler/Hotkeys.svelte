<svelte:window on:keydown={handleHotkey} />

<script>

	import {invertVerticalAlignment, showSubtitlesOnVideo} from "./settingsStore";

	function handleHotkey(e) {
		const key = e.key.toLowerCase();
		if (key === 'h') {
			showSubtitlesOnVideo.update(show => !show);
		}
		else if (key === 'i') {
			invertVerticalAlignment.update(invert => !invert);
		}
	}
</script>
