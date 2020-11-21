<style>
    p {
        cursor: pointer;
        color: white;
        margin: 0;
        padding: 0;
        white-space: pre-wrap;
        font-family: "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
    }
    p:hover {
        /* need important so it can override .ass inline styles */
        color: #0aff8c !important;
    }
</style>

<p
	style="{genBaseStyles(sub)}"
	data-sub-style={sub.style}
	data-sub-id={sub._id}
	on:click={() => define(sub.text)}
	title="click to search this phrase on Jisho.org"
>
	{#if sub.phrases}
		{#each sub.phrases as phrase (phrase._id)}
			{#if phrase.fadeIn || phrase.fadeOut}
				<span style={genPhraseStyles(phrase)} in:fade={genFade(phrase.fadeIn)} out:fade={genFade(phrase.fadeOut)} data-phrase-id={phrase._id}>{phrase.text}</span>
			{:else}
				<span style={genPhraseStyles(phrase)} data-phrase-id={phrase._id}>{phrase.text}</span>
			{/if}
		{/each}
	{:else}
		{sub.text}
	{/if}
</p>

<script>
	import {invertVerticalAlignment, subtitleFallbackColor} from "../settingsStore";
	import {fade} from 'svelte/transition';
	import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();

	export let sub;
	export let styles;

	function define(phrase) {
		dispatch('define-pauser');
		window.open(`https://jisho.org/search/${encodeURIComponent(phrase.trim())}`);
	}

	function joinStyles(stylesArray) {
		return stylesArray
			//ensure we're not putting `;undefined;` in the styles
			.filter(style => !!style)
			.join(';');
	}
	function genBaseStyles(sub) {
		let appliedStyles = [
			`color: ${$subtitleFallbackColor}`
		];

		//ASS subtitles inherit their base styles from some style declarations
		const style = styles[sub.style];
		appliedStyles.push(style.inline);

		appliedStyles = appliedStyles.concat([
			(sub.inline || ''),
		]);

		return joinStyles(appliedStyles);
	}
	function genPhraseStyles(phrase) {
		return joinStyles([
			phrase.inline,
		]);
	}
	function genFade(dur) {
		if (typeof dur !== 'number') {
			dur = 0;
		}
		return {delay: 0, duration: dur};
	}
</script>