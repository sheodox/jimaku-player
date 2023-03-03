<style>
	.fine-align {
		top: 50vh;
		left: 50vw;
		transform: translate(-50%, -50%) !important;
		max-width: 20rem;
	}
</style>

<div class="fine-align panel p-3">
	<h1 class="m-3">Fine Adjustment</h1>
	<p class="mt-0">
		Play the video and use these adjustment buttons until the subtitles show at the right time.
		<br />
		<strong>Subtitles are {$explainedSecondsStore}</strong>
	</p>
	<p>Do the subtitles show...</p>
	<button on:click={changeAlignment(-1 * COARSE_ADJUST_AMOUNT_MS)} class="secondary">Way too late?</button>
	<button on:click={changeAlignment(-1 * FINE_ADJUST_AMOUNT_MS)} class="secondary">Too late?</button>
	<button on:click={changeAlignment(FINE_ADJUST_AMOUNT_MS)} class="secondary">Too early?</button>
	<button on:click={changeAlignment(COARSE_ADJUST_AMOUNT_MS)} class="secondary">Way too early?</button>
	<br />
	<button on:click={done} class="primary mt-4">Done</button>
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import {
		alignmentStore,
		COARSE_ADJUST_AMOUNT_MS,
		explainedSecondsStore,
		FINE_ADJUST_AMOUNT_MS,
		saveAlignmentToHistory,
	} from './stores/alignment';

	const changeAlignment = (change: number) => () => {
		alignmentStore.update((n) => n + change);
	};

	const dispatch = createEventDispatcher();

	function done() {
		saveAlignmentToHistory(get(alignmentStore));
		dispatch('close');
	}
</script>
