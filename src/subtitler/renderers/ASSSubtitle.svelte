<style>
    p {
		cursor: default;
        color: white;
        margin: 0;
        padding: 0;
        white-space: pre-wrap;
        font-family: "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
    }
    p:hover {
        /* need important so it can override .ass inline styles */
        color: #0aff8c !important;
		cursor: pointer;
	}

	@keyframes movement {
		from {
			top: var(--move-from-top);
			left: var(--move-from-left);
		}
        to {
            top: var(--move-to-top);
            left: var(--move-to-left);
        }
	}

	.has-movement {
		position: fixed;
		animation: movement var(--move-duration) linear forwards;
		animation-delay: var(--move-delay);
	}
</style>

<p
	style="{genBaseStyles(sub)}"
	class:has-movement={!!sub.movement}
	data-sub-style={sub.style}
	data-sub-id={sub._id}
	on:click={() => performSubtitleClickAction(sub.text)}
	title="click to search this phrase on Jisho.org"
>
	{#if sub.phrases}
		{#each sub.phrases as phrase (phrase._id)}
			{#if phrase.fadeIn || phrase.fadeOut}
				<span
					style={genPhraseStyles(phrase, sub)}
					in:fade={genFade(phrase.fadeIn)}
					out:fade={genFade(phrase.fadeOut)}
					data-phrase-id={phrase._id}
				>
					{#if phrase.html}
						{@html phrase.html}
					{/if}
					{phrase.text}
				</span>
			{:else}
				<span style={genPhraseStyles(phrase, sub)} data-phrase-id={phrase._id}>
					{#if phrase.html}
						{@html phrase.html}
					{/if}
					{phrase.text}
				</span>
			{/if}
		{/each}
	{:else}
		{sub.text}
	{/if}
</p>

<script>
	import {fade} from 'svelte/transition';
	import {performSubtitleClickAction} from "./render-common";
	import {subtitleFallbackColor} from '../settingsStore';
	import {
		joinStyles,
		fontScale,
	} from './render-common';

	export let sub;
	export let styles;

	function genFade(dur) {
		if (typeof dur !== 'number') {
			dur = 0;
		}
		return {delay: 0, duration: dur};
	}

	function genPhraseStyles(phrase, sub) {
		const style = styles[sub.style];
		return joinStyles([
			//not inheriting the font-size from the sub, instead apply it directly to every phrase.
			//if a large font size is on the sub, but as small font size override, the bounding box
			//of the sub will still be large, and the subtitle will be the right size, but in the wrong place
			`font-size: ${style.fontSize * $fontScale}vh`,
			phrase.inline,
			//if the phrase has a font size override, this will override the sub's font size
			phrase.fontSize ? `font-size: ${phrase.fontSize * $fontScale}vh` : null
		]);
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

		//if there are no overrides the text will be directly mounted inside the <p> and not in <span>s.
		//as such we can apply the font size directly to the base element, avoiding the problem described
		//in the comments in genPhraseStyles.
		if (!sub.phrases) {
			appliedStyles.push(`font-size: ${style.fontSize * $fontScale}vh`);
		}

		if (sub.movement) {
			const timings = sub.movement.timings,
				timed = sub.movement.timings.length > 0,
				duration = timed ? timings[1] - timings[0] : sub.end - sub.start,
				delay = timed ? timings[0] : 0;

			appliedStyles = appliedStyles.concat([
				`--move-duration: ${duration}ms`,
				`--move-delay: ${delay}ms`,
				`--move-from-top: ${sub.movement.y1}`,
				`--move-from-left: ${sub.movement.x1}`,
				`--move-to-top: ${sub.movement.y2}`,
				`--move-to-left: ${sub.movement.x2}`,
			])
		}
		return joinStyles(appliedStyles);
	}
</script>