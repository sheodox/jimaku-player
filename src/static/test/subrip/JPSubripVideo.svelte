<style>
	video {
		height: 100%;
		width: 100%;
	}
</style>

<video controls src="/test/nothing.webm" muted bind:currentTime />
<SubRipRenderer {subtitles} />

<script lang="ts">
	import SubRipRenderer from '../../subtitler/renderers/SubRipRenderer.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { SubRip, SubRipSubtitle } from '../../subtitler/parsers/SubRip';

	export let currentTime: number;

	const subtitles = writable<SubRipSubtitle[]>([]);

	onMount(async () => {
		const testScript = await fetch('/test/subrip/vtt-test.vtt').then((res) => res.text()),
			subs = new SubRip(testScript, 'vtt-test.vtt');
		subtitles.set(subs.getSubs(1000 * currentTime));
	});
</script>
