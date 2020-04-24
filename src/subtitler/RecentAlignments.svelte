<style>
	button {
		margin: 0.5rem;
		align-self: center;
		max-width: 20rem;
	}
</style>
{#if $alignmentHistoryStore.length}
	<div>
		{#each $alignmentHistoryStore as history}
			<button on:click={() => align(history.alignment)} class="secondary">{history.signed}秒</button>
		{/each}
	</div>
{/if}

<script>
	import {
		alignmentHistoryStore,
		alignmentStore,
		saveAlignmentToHistory
	} from './alignmentStore';
	import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();

	function align(alignment) {
		alignmentStore.set(alignment);
		saveAlignmentToHistory(alignment);
		dispatch('aligned');
	}
</script>
