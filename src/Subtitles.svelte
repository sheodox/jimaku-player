<style>
    p {
		cursor: pointer;
        color: white;
		margin: 0;
		padding: 0;
	}
	p:hover {
		/* need important so it can override .ass inline styles */
		color: #0aff8c !important;
	}
</style>
<script>
	import {createEventDispatcher} from 'svelte';
	export let current = []; // the subtitles that are currently supposed to be shown
	export let styles = {}; // parsed styles from the subtitle file
	export let format = ''; // subtitle file format that was parsed
	export let visible = true;
	const dispatch = createEventDispatcher();

	function define(phrase) {
		dispatch('define-pauser');
		window.open(`https://jisho.org/search/${encodeURIComponent(phrase.trim())}`);
	}

	function genStyles(sub) {
		if (format === 'srt') {
			return `font-size: ${1.5 + 1.5 * (sub.line ? sub.line : 1)}rem; text-shadow: black 2px 2px 0, black 2px -2px 0, black -2px 2px 0, black -2px -2px 0, black 2px 0 0, black 0 2px 0, black -2px 0 0, black 0 -2px 0, black 2px 2px 2px`
		}
		else if (format === 'ass' && sub.style in styles) {
			return styles[sub.style].inline;
		}
	}
</script>

<div class="subtitles">
	{#if visible}
		{#each current as sub}
			<p style="{genStyles(sub)}" on:click={() => define(sub.text)} title="click to search this phrase on Jisho.org">{sub.text}</p>
		{/each}
	{/if}
</div>
