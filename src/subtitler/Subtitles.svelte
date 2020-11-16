<style>
    p {
		cursor: pointer;
        color: white;
		margin: 0;
		padding: 0;
		white-space: pre;
		font-family: "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
		text-align: center;
	}
	p:hover {
		/* need important so it can override .ass inline styles */
		color: #0aff8c !important;
	}
</style>
<script>
	import {onDestroy} from 'svelte';
	import {
		showSubtitlesOnVideo,
		subtitleFallbackColor,
		invertVerticalAlignment
	} from './settingsStore';
	import {createEventDispatcher} from 'svelte';
	import {fade} from 'svelte/transition';
	export let current = []; // the subtitles that are currently supposed to be shown
	export let styles = {}; // base styles from the subtitle file
	export let format = ''; // subtitle file format that was parsed
	const dispatch = createEventDispatcher();

	let subColor, verticalAlignment;
	const unsubs = [
		subtitleFallbackColor.subscribe(color => {
			subColor = color;
		}),
		invertVerticalAlignment.subscribe(invert => {
			verticalAlignment = invert ? 'inverted' : 'normal'
		})
	];

	onDestroy(() => {
		unsubs.forEach(unsub => unsub())
	});

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
			`color: ${subColor}`
		];
		//ASS subtitles inherit their base styles from some style declarations
		if (format === 'ass' && sub.style in styles) {
			const style = styles[sub.style];
			appliedStyles.push(style.inline);
			appliedStyles.push(style.verticalAlignment[verticalAlignment]);
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

<div class="subtitles">
	{#if $showSubtitlesOnVideo}
		{#each current as sub (sub._id)}
			<p style="{genBaseStyles(sub)}" data-sub-style={sub.style} on:click={() => define(sub.text)} title="click to search this phrase on Jisho.org">
				{#if sub.phrases}
					{#each sub.phrases as phrase (phrase._id)}
						<span style={genPhraseStyles(phrase)} in:fade={genFade(phrase.fadeIn)} out:fade={genFade(phrase.fadeOut)}>{phrase.text}</span>
					{/each}
				{:else}
					{sub.text}
				{/if}
			</p>
		{/each}
	{/if}
</div>
