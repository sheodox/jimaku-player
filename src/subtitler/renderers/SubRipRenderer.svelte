<style>
    p {
		position: fixed;
        color: white;
		margin: 0;
		padding: 0;
		white-space: pre-line;
		text-align: center;
		max-width: 100vw;
		font-family: "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
		display: block;
        transition: top 0.1s;
		text-shadow: -4px -4px 0px rgba(9, 9, 9, 255), -4px -3px 0px rgba(9, 9, 9, 255), -4px -2px 0px rgba(9, 9, 9, 255), -4px -1px 0px rgba(9, 9, 9, 255), -4px 0px 0px rgba(9, 9, 9, 255), -4px 1px 0px rgba(9, 9, 9, 255), -4px 2px 0px rgba(9, 9, 9, 255), -4px 3px 0px rgba(9, 9, 9, 255), -4px 4px 0px rgba(9, 9, 9, 255), -3px -4px 0px rgba(9, 9, 9, 255), -3px -3px 0px rgba(9, 9, 9, 255), -3px -2px 0px rgba(9, 9, 9, 255), -3px -1px 0px rgba(9, 9, 9, 255), -3px 0px 0px rgba(9, 9, 9, 255), -3px 1px 0px rgba(9, 9, 9, 255), -3px 2px 0px rgba(9, 9, 9, 255), -3px 3px 0px rgba(9, 9, 9, 255), -3px 4px 0px rgba(9, 9, 9, 255), -2px -4px 0px rgba(9, 9, 9, 255), -2px -3px 0px rgba(9, 9, 9, 255), -2px -2px 0px rgba(9, 9, 9, 255), -2px -1px 0px rgba(9, 9, 9, 255), -2px 0px 0px rgba(9, 9, 9, 255), -2px 1px 0px rgba(9, 9, 9, 255), -2px 2px 0px rgba(9, 9, 9, 255), -2px 3px 0px rgba(9, 9, 9, 255), -2px 4px 0px rgba(9, 9, 9, 255), -1px -4px 0px rgba(9, 9, 9, 255), -1px -3px 0px rgba(9, 9, 9, 255), -1px -2px 0px rgba(9, 9, 9, 255), -1px -1px 0px rgba(9, 9, 9, 255), -1px 0px 0px rgba(9, 9, 9, 255), -1px 1px 0px rgba(9, 9, 9, 255), -1px 2px 0px rgba(9, 9, 9, 255), -1px 3px 0px rgba(9, 9, 9, 255), -1px 4px 0px rgba(9, 9, 9, 255), 0px -4px 0px rgba(9, 9, 9, 255), 0px -3px 0px rgba(9, 9, 9, 255), 0px -2px 0px rgba(9, 9, 9, 255), 0px -1px 0px rgba(9, 9, 9, 255), 0px 0px 0px rgba(9, 9, 9, 255), 0px 1px 0px rgba(9, 9, 9, 255), 0px 2px 0px rgba(9, 9, 9, 255), 0px 3px 0px rgba(9, 9, 9, 255), 0px 4px 0px rgba(9, 9, 9, 255), 1px -4px 0px rgba(9, 9, 9, 255), 1px -3px 0px rgba(9, 9, 9, 255), 1px -2px 0px rgba(9, 9, 9, 255), 1px -1px 0px rgba(9, 9, 9, 255), 1px 0px 0px rgba(9, 9, 9, 255), 1px 1px 0px rgba(9, 9, 9, 255), 1px 2px 0px rgba(9, 9, 9, 255), 1px 3px 0px rgba(9, 9, 9, 255), 1px 4px 0px rgba(9, 9, 9, 255), 2px -4px 0px rgba(9, 9, 9, 255), 2px -3px 0px rgba(9, 9, 9, 255), 2px -2px 0px rgba(9, 9, 9, 255), 2px -1px 0px rgba(9, 9, 9, 255), 2px 0px 0px rgba(9, 9, 9, 255), 2px 1px 0px rgba(9, 9, 9, 255), 2px 2px 0px rgba(9, 9, 9, 255), 2px 3px 0px rgba(9, 9, 9, 255), 2px 4px 0px rgba(9, 9, 9, 255), 3px -4px 0px rgba(9, 9, 9, 255), 3px -3px 0px rgba(9, 9, 9, 255), 3px -2px 0px rgba(9, 9, 9, 255), 3px -1px 0px rgba(9, 9, 9, 255), 3px 0px 0px rgba(9, 9, 9, 255), 3px 1px 0px rgba(9, 9, 9, 255), 3px 2px 0px rgba(9, 9, 9, 255), 3px 3px 0px rgba(9, 9, 9, 255), 3px 4px 0px rgba(9, 9, 9, 255), 4px -4px 0px rgba(9, 9, 9, 255), 4px -3px 0px rgba(9, 9, 9, 255), 4px -2px 0px rgba(9, 9, 9, 255), 4px -1px 0px rgba(9, 9, 9, 255), 4px 0px 0px rgba(9, 9, 9, 255), 4px 1px 0px rgba(9, 9, 9, 255), 4px 2px 0px rgba(9, 9, 9, 255), 4px 3px 0px rgba(9, 9, 9, 255), 4px 4px 0px rgba(9, 9, 9, 255), 2px 2px 0px rgba(20, 20, 20, 195);
	}
	p:hover {
        cursor: pointer;
        color: #0aff8c !important;
	}
    .non-actionable {
        pointer-events: none;
    }
</style>

<div class="subtitles" class:non-actionable={!$subtitleActionable}>
    {#if $showSubtitlesOnVideo}
        {#each $subtitles as sub (sub._id)}
            <p
                style="{genBaseStyles(sub, $userActive)}"
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

<script>
	import {
	    joinStyles,
        fontScale,
        subtitleActionable,
	} from './render-common';
	import {
		showSubtitlesOnVideo,
		subtitleFallbackColor,
		invertVerticalAlignment,
	} from '../settingsStore';
    import {performSubtitleClickAction} from "./render-common";
	import {userActive} from "../activity-stores";

	export let subtitles; //store for which subtitles should be shown each frame

	function genBaseStyles(sub, userActive) {
		let appliedStyles = [
			`color: ${$subtitleFallbackColor}`,
            `font-size: ${5 * $fontScale}vh`
		];

		if (sub.verticalAlignment) {
			appliedStyles.push(
				//alignment can be either 'normal' which respects the subtitle's vertical alignment,
				//or 'inverted' which does the opposite, if the user wants to use these subs
				//along with VRV's, otherwise they'd likely overlap
				sub.verticalAlignment[$invertVerticalAlignment ? 'inverted' : 'normal'][userActive ? 'active' : 'inactive']
			)
		}
		appliedStyles = appliedStyles.concat([
			(sub.inline || ''),
		]);

		return joinStyles(appliedStyles);
	}
</script>
