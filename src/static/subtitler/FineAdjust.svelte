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
		<strong>Subtitles are being {$explainedSecondsStore}</strong>
	</p>
	<p>Do the subtitles show...</p>
	<button on:click={changeAlignment(-1 * coarseAdjustAmount)} class="secondary">Way too late?</button>
	<button on:click={changeAlignment(-1 * fineAdjustAmount)} class="secondary">Too late?</button>
	<button on:click={changeAlignment(fineAdjustAmount)} class="secondary">Too early?</button>
	<button on:click={changeAlignment(coarseAdjustAmount)} class="secondary">Way too early?</button>
	<br />
	<button on:click={done} class="primary mt-4">Done</button>
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { alignmentStore, explainedSecondsStore, saveAlignmentToHistory } from './stores/alignment';

	const changeAlignment = (change: number) => () => {
		alignmentStore.update((n) => n + change);
	};

	const dispatch = createEventDispatcher(),
		//ms that alignment is adjusted by with each click
		coarseAdjustAmount = 1000,
		fineAdjustAmount = 200;

	function done() {
		saveAlignmentToHistory(get(alignmentStore));
		dispatch('close');
	}
</script>
