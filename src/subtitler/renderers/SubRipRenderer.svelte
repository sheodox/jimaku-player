<style>
    p {
		cursor: pointer;
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
		color: #0aff8c !important;
	}
</style>

<div class="subtitles">
    {#if $showSubtitlesOnVideo}
        {#each $subtitles as sub (sub._id)}
            <p
                style="{genBaseStyles(sub, $userActive)}"
                data-sub-style={sub.style}
                data-sub-id={sub._id}
                on:click={() => define(sub.text)}
                title="click to search this phrase on Jisho.org"
            >
                {sub.text}
            </p>
        {/each}
    {/if}
</div>

<script>
	import {joinStyles} from './render-common';
	import {
		showSubtitlesOnVideo,
		subtitleFallbackColor,
		invertVerticalAlignment
	} from '../settingsStore';
	import {createEventDispatcher} from 'svelte';
	import {fade} from 'svelte/transition';
	import {userActive} from "../activity-stores";
	const dispatch = createEventDispatcher();

	export let subtitles; //store for which subtitles should be shown each frame

	function define(phrase) {
		dispatch('define-pauser');
		window.open(`https://jisho.org/search/${encodeURIComponent(phrase.trim())}`);
	}

	function genBaseStyles(sub, userActive) {
		let appliedStyles = [
			`color: ${$subtitleFallbackColor}`
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
