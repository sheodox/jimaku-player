<style>
	button {
		align-self: center;
		max-width: 20rem;
		/* prevent the buttons from shifting around, seeing part of the line should be good enough for now, though it can easily get cut off */
		overflow: hidden;
		margin: 0;
	}
	pre {
		margin: 0;
		padding: 0;
		font-size: 0.7rem;
	}

	/* show buttons with subtitle previews in a grid, otherwise they move around a lot when allowd to just flow based on size */
	.with-previews {
		display: grid;
		gap: var(--sx-spacing-3);
		grid-template-columns: 1fr 1fr;
	}
	.no-previews button {
		margin: var(--sx-spacing-1);
	}
</style>

{#if $alignmentHistoryStore.length}
	<div class={showPreviews ? 'with-previews' : 'no-previews'}>
		{#each $alignmentHistoryStore as history}
			<button on:click={() => align(history.alignment)} class="secondary" use:previewSubtitles={history.alignment}>
				{history.signed} seconds
				{#if showPreviews}
					<pre class="subtitle-preview" />
				{/if}
			</button>
		{/each}
	</div>
{/if}

<script lang="ts">
	import { writable } from 'svelte/store';
	import { alignmentHistoryStore, alignmentStore, saveAlignmentToHistory } from './stores/alignment';
	import { createEventDispatcher } from 'svelte';
	import { createSubtitleTimer } from './stores/subtitle-timer';
	export let showPreviews = false;
	const dispatch = createEventDispatcher();

	function previewSubtitles(element: HTMLElement, alignment: number) {
		if (!showPreviews) {
			return;
		}

		//we need to use a store to update the subtitle timer. we COULD use a key on these buttons, but when they get detached
		//it triggers another mouseenter on the tray and pauses the video. weird bug so just make the proper adjustments
		const alignmentStore = writable(alignment),
			previewEl = element.querySelector('.subtitle-preview'),
			//watch a store with this offset so we can show a preview of the lines showing at that time in the video so you don't
			//have to click around randomly when trying to pick a previous alignment
			store = createSubtitleTimer(alignmentStore),
			unsub = store.subscribe((subtitles) => {
				//many subtitles are often one or two lines, occasionally more but not as often.
				//so pad everything out to two lines minimum to prevent too much movement
				const text =
					subtitles
						.map((sub) => sub.text)
						.join('\n')
						.trim() || '\n\n';
				previewEl.textContent = !text.includes('\n') ? '\n' + text : text;
			});

		return {
			update: (newAlignment: number) => alignmentStore.set(newAlignment),
			destroy: unsub,
		};
	}

	function align(alignment: number) {
		alignmentStore.set(alignment);
		saveAlignmentToHistory(alignment);
		dispatch('aligned');
	}
</script>
