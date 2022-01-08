<style>
	.a:hover {
		text-decoration: underline;
	}
	li {
		text-align: center;
	}
	.a {
		white-space: pre;
		background: none !important;
		color: white;
		text-transform: none;
		font-weight: normal;
		margin: 0;
		padding: 0;
		font-size: var(--shdx-font-size-5);
		line-height: 1.2;
		text-align: center;
	}
	ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column-reverse;
	}
	.muted {
		font-style: italic;
	}
</style>

<ul id="recent-subs">
	{#each recentSubs as sub (sub._id)}
		<li
			in:fly={{ y: -50, duration: 200 }}
			out:fly={{ y: 50, duration: 200 }}
			animate:flip={{ duration: 200 }}
			class="mb-3"
		>
			<button class="small-button secondary" on:click={() => rewindToSubtitle(sub)} title="Rewind to this subtitle"
				>⯇<span class="sr">Rewind to this subtitle</span></button
			>
			{#if $subtitleClickAction === 'nothing'}
				{(sub.text || '').trim()}
			{:else}
				<button class="a" on:click={() => performSubtitleClickAction(sub.text)}>
					{(sub.text || '').trim()}
				</button>
			{/if}
		</li>
	{:else}
		<p class="muted text-align-center">No subtitles yet!</p>
	{/each}
</ul>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { alignmentStore } from '../stores/alignment';
	import { performSubtitleClickAction } from '../renderers/render-common';
	import { subtitleClickAction } from '../stores/settings';
	import type { Subtitle } from '../types/subtitles';

	export let recentSubs: Subtitle[];

	function rewindToSubtitle(sub: Subtitle) {
		// rewind the video to just a bit before the line is said, less jarring and hides tiny misalignment differences
		document.querySelector('video').currentTime = (sub.start + $alignmentStore) / 1000 - 0.5;
	}
</script>
