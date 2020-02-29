<style>
    .subtitles {

	}
    p {
		cursor: pointer;
        color: white;
		margin: 0;
		padding: 0;
		text-shadow: black 2px 2px 0, black 2px -2px 0, black -2px 2px 0, black -2px -2px 0, black 2px 0 0, black 0 2px 0, black -2px 0 0, black 0 -2px 0, black 2px 2px 2px;
	}
	p:hover {
		color: #0aff8c;
	}
</style>
<script>
	export let current = [];

	function define(phrase) {
		window.open(`https://jisho.org/search/${encodeURIComponent(phrase.trim())}`);
	}
</script>

<div class="subtitles">
	{#each current as sub}
		<p style="font-size: {0.5 + 2.5 * sub.line}rem" on:click={() => define(sub.text)} title="click to search this phrase on Jisho.org">{sub.text}</p>
	{/each}
</div>
