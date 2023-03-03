<style>
	.a:hover {
		text-decoration: underline;
	}
	.a {
		background: none !important;
		color: white;
		text-transform: none;
		font-weight: normal;
		margin: 0;
		padding: 0;
		font-size: var(--sx-font-size-5);
		line-height: 1.2;
		text-align: left;
	}
	ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.muted {
		font-style: italic;
	}
	.subtitle {
		white-space: wrap;
	}
</style>

<ul id="recent-subs">
	{#each recentSubs as sub (sub._id)}
		<li class="mb-3 f-row" in:fly={{ y: -50, duration: 100 }}>
			<div class="subtitle f-1">
				{#if $subtitleClickAction === 'nothing'}
					{sub.text.trim()}
				{:else}
					<button class="a" on:click={() => performSubtitleClickAction([sub.text])}>
						{sub.text.trim()}
					</button>
				{/if}
			</div>
			<div class="rewind">
				<button
					class="small-button secondary"
					on:click={() => rewindToSubtitle(sub.start)}
					title="Rewind to this subtitle">⯇<span class="sr">Rewind to this subtitle</span></button
				>
			</div>
		</li>
	{:else}
		<p class="muted text-align-center">No subtitles yet!</p>
	{/each}
</ul>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { performSubtitleClickAction } from '../renderers/render-common';
	import { subtitleClickAction } from '../stores/settings';
	import { rewindToSubtitle } from '../video-controller';
	import type { Subtitle } from '../types/subtitles';

	export let recentSubs: Subtitle[];
</script>
