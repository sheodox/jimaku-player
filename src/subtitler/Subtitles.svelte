<style>
    p {
		cursor: pointer;
        color: white;
		margin: 0;
		padding: 0;
		white-space: pre;
		font-family: "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
	}
	p:hover {
		/* need important so it can override .ass inline styles */
		color: #0aff8c !important;
	}
</style>
<script>
	import {createEventDispatcher} from 'svelte';
	import {fade} from 'svelte/transition';
	export let current = []; // the subtitles that are currently supposed to be shown
	export let styles = {}; // base styles from the subtitle file
	export let format = ''; // subtitle file format that was parsed
	export let visible = true;
	export let verticalAlignment = 'inverted';
	const dispatch = createEventDispatcher();

	function define(phrase) {
		dispatch('define-pauser');
		window.open(`https://jisho.org/search/${encodeURIComponent(phrase.trim())}`);
	}

	function getFontSize(sub) {
		if (!sub.fontScaled) {
			return '';
		}
		return `font-size: ${window.innerHeight > sub.fontScalingThreshold ? sub.fontMax : sub.fontScaled}`;
	}

	function joinStyles(stylesArray) {
		return stylesArray
			//ensure we're not putting `;undefined;` in the styles
			.filter(style => !!style)
			.join(';');
	}
	function genStyles(sub) {
		let appliedStyles = [];
		//ASS subtitles inherit their base styles from some style declarations
		if (format === 'ass' && sub.style in styles) {
			appliedStyles.push(styles[sub.style].inline);
            appliedStyles.push(getFontSize(styles[sub.style]))
		}

		if (sub.verticalAlignment) {
			appliedStyles.push(
				//alignment can be either 'normal' which respects the subtitle's vertical alignment,
				//or 'inverted' which does the opposite, if the user wants to use these subs
				//along with VRV's, otherwise they'd likely overlap
				sub.verticalAlignment[verticalAlignment]
			)
		}
		appliedStyles = appliedStyles.concat([
			(sub.inline || ''),
			getFontSize(sub)
		]);

		return joinStyles(appliedStyles);
	}
	function genPhraseStyles(phrase) {
		return joinStyles([
			phrase.inline,
			getFontSize(phrase)
		]);
	}
</script>

<div class="subtitles">
	{#if visible}
		{#each current as sub}
			<p style="{genStyles(sub)}" data-sub-style={sub.style} on:click={() => define(sub.text)} title="click to search this phrase on Jisho.org">
				{#if sub.phrases}
					{#each sub.phrases as phrase}
						<span style={genPhraseStyles(phrase)} in:fade={{duration: phrase.fadeIn || 0}} out:fade={{duration: phrase.fadeOut || 0}}>{phrase.text}</span>
					{/each}
				{:else}
					{sub.text}
				{/if}
			</p>
		{/each}
	{/if}
</div>
