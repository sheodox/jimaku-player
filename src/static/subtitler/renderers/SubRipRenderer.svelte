<style>
	.subtitles {
		--player-width: calc(100vh * var(--aspect-ratio));
		height: 100vh;
		width: var(--player-width);
		margin: 0 auto;
		position: relative;
		pointer-events: none !important;
	}
	p {
		position: fixed;
		color: white;
		margin: 0;
		padding: 0;
		white-space: pre-line;
		text-align: center;
		max-width: var(--player-width);
		font-family: 'Source Han Sans', '源ノ角ゴシック', 'Hiragino Sans', 'HiraKakuProN-W3', 'Hiragino Kaku Gothic ProN W3',
			'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', 'Noto Sans JP', 'Noto Sans CJK JP', 'Noto Sans', 'メイリオ',
			Meiryo, '游ゴシック', YuGothic, 'ＭＳ Ｐゴシック', 'MS PGothic', 'ＭＳ ゴシック', 'MS Gothic', sans-serif;
		display: block;
		transition: top 0.1s;
		text-shadow: -4px -4px 0px rgba(9, 9, 9, 255), -4px -3px 0px rgba(9, 9, 9, 255), -4px -2px 0px rgba(9, 9, 9, 255),
			-4px -1px 0px rgba(9, 9, 9, 255), -4px 0px 0px rgba(9, 9, 9, 255), -4px 1px 0px rgba(9, 9, 9, 255),
			-4px 2px 0px rgba(9, 9, 9, 255), -4px 3px 0px rgba(9, 9, 9, 255), -4px 4px 0px rgba(9, 9, 9, 255),
			-3px -4px 0px rgba(9, 9, 9, 255), -3px -3px 0px rgba(9, 9, 9, 255), -3px -2px 0px rgba(9, 9, 9, 255),
			-3px -1px 0px rgba(9, 9, 9, 255), -3px 0px 0px rgba(9, 9, 9, 255), -3px 1px 0px rgba(9, 9, 9, 255),
			-3px 2px 0px rgba(9, 9, 9, 255), -3px 3px 0px rgba(9, 9, 9, 255), -3px 4px 0px rgba(9, 9, 9, 255),
			-2px -4px 0px rgba(9, 9, 9, 255), -2px -3px 0px rgba(9, 9, 9, 255), -2px -2px 0px rgba(9, 9, 9, 255),
			-2px -1px 0px rgba(9, 9, 9, 255), -2px 0px 0px rgba(9, 9, 9, 255), -2px 1px 0px rgba(9, 9, 9, 255),
			-2px 2px 0px rgba(9, 9, 9, 255), -2px 3px 0px rgba(9, 9, 9, 255), -2px 4px 0px rgba(9, 9, 9, 255),
			-1px -4px 0px rgba(9, 9, 9, 255), -1px -3px 0px rgba(9, 9, 9, 255), -1px -2px 0px rgba(9, 9, 9, 255),
			-1px -1px 0px rgba(9, 9, 9, 255), -1px 0px 0px rgba(9, 9, 9, 255), -1px 1px 0px rgba(9, 9, 9, 255),
			-1px 2px 0px rgba(9, 9, 9, 255), -1px 3px 0px rgba(9, 9, 9, 255), -1px 4px 0px rgba(9, 9, 9, 255),
			0px -4px 0px rgba(9, 9, 9, 255), 0px -3px 0px rgba(9, 9, 9, 255), 0px -2px 0px rgba(9, 9, 9, 255),
			0px -1px 0px rgba(9, 9, 9, 255), 0px 0px 0px rgba(9, 9, 9, 255), 0px 1px 0px rgba(9, 9, 9, 255),
			0px 2px 0px rgba(9, 9, 9, 255), 0px 3px 0px rgba(9, 9, 9, 255), 0px 4px 0px rgba(9, 9, 9, 255),
			1px -4px 0px rgba(9, 9, 9, 255), 1px -3px 0px rgba(9, 9, 9, 255), 1px -2px 0px rgba(9, 9, 9, 255),
			1px -1px 0px rgba(9, 9, 9, 255), 1px 0px 0px rgba(9, 9, 9, 255), 1px 1px 0px rgba(9, 9, 9, 255),
			1px 2px 0px rgba(9, 9, 9, 255), 1px 3px 0px rgba(9, 9, 9, 255), 1px 4px 0px rgba(9, 9, 9, 255),
			2px -4px 0px rgba(9, 9, 9, 255), 2px -3px 0px rgba(9, 9, 9, 255), 2px -2px 0px rgba(9, 9, 9, 255),
			2px -1px 0px rgba(9, 9, 9, 255), 2px 0px 0px rgba(9, 9, 9, 255), 2px 1px 0px rgba(9, 9, 9, 255),
			2px 2px 0px rgba(9, 9, 9, 255), 2px 3px 0px rgba(9, 9, 9, 255), 2px 4px 0px rgba(9, 9, 9, 255),
			3px -4px 0px rgba(9, 9, 9, 255), 3px -3px 0px rgba(9, 9, 9, 255), 3px -2px 0px rgba(9, 9, 9, 255),
			3px -1px 0px rgba(9, 9, 9, 255), 3px 0px 0px rgba(9, 9, 9, 255), 3px 1px 0px rgba(9, 9, 9, 255),
			3px 2px 0px rgba(9, 9, 9, 255), 3px 3px 0px rgba(9, 9, 9, 255), 3px 4px 0px rgba(9, 9, 9, 255),
			4px -4px 0px rgba(9, 9, 9, 255), 4px -3px 0px rgba(9, 9, 9, 255), 4px -2px 0px rgba(9, 9, 9, 255),
			4px -1px 0px rgba(9, 9, 9, 255), 4px 0px 0px rgba(9, 9, 9, 255), 4px 1px 0px rgba(9, 9, 9, 255),
			4px 2px 0px rgba(9, 9, 9, 255), 4px 3px 0px rgba(9, 9, 9, 255), 4px 4px 0px rgba(9, 9, 9, 255),
			2px 2px 0px rgba(20, 20, 20, 195);
	}
	p:hover {
		cursor: pointer;
		color: #0aff8c !important;
	}
	.subtitles.actionable p {
		pointer-events: auto;
	}
</style>

<div class={`subtitles ${$subtitleActionable ? 'actionable' : 'non-actionable'}`} style={`--aspect-ratio: ${aspect}`}>
	{#if $showSubtitlesOnVideo}
		{#each $subtitles as sub (sub._id)}
			<p
				style={genBaseStyles(sub, $userActive)}
				data-sub-style={sub.style}
				data-sub-id={sub._id}
				on:click={() => performSubtitleClickAction(sub.text)}
				title="click to search this phrase on Jisho.org"
			>
				{sub.text}
			</p>
		{/each}
	{/if}
</div>

<script lang="ts">
	import {
		joinStyles,
		fontScale,
		subtitleActionable,
		aspectRatioStringToNumber,
		aspectRatioSetting,
	} from './render-common';
	import { showSubtitlesOnVideo, subtitleFallbackColor, invertVerticalAlignment } from '../stores/settings';
	import { performSubtitleClickAction } from './render-common';
	import { userActive } from '../stores/activity';
	import type { Readable } from 'svelte/store';
	import type { SubRipSubtitle } from '../parsers/SubRip';

	export let subtitles: Readable<SubRipSubtitle[]>; //store for which subtitles should be shown each frame

	// unlike ASS, SRT and VTT don't specify the video's resolution or aspect in the script,
	// so there's nothing to do for 'auto', just let it default to 16:9
	$: aspect = aspectRatioStringToNumber($aspectRatioSetting);

	function genBaseStyles(sub: SubRipSubtitle, userActive: boolean) {
		let appliedStyles = [`color: ${$subtitleFallbackColor}`, `font-size: ${5 * $fontScale}vh`];

		if (sub.verticalAlignment) {
			appliedStyles.push(
				//alignment can be either 'normal' which respects the subtitle's vertical alignment,
				//or 'inverted' which does the opposite, if the user wants to use these subs
				//along with VRV's, otherwise they'd likely overlap
				sub.verticalAlignment[$invertVerticalAlignment ? 'inverted' : 'normal'][userActive ? 'active' : 'inactive']
			);
		}
		appliedStyles = appliedStyles.concat([sub.inline || '']);

		return joinStyles(appliedStyles);
	}
</script>
