<style>
	.alignment-buttons {
		display: flex;
		flex-direction: column;
	}
	.alignment-buttons button {
		margin: 0.5rem;
		align-self: center;
	}
    .row {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
</style>
<div class="alignment-buttons">
	<button on:click={align}>
		Click when the first line is said:
		<br />
		<pre>{firstSubtitle.text}</pre>
	</button>
	<div class="row">
		{#if typeof lastAlignment === 'number'}
			<button on:click={useLastAlignment}>
				Use the last alignment ({Math.abs(lastAlignmentSeconds)} seconds {lastAlignment > 0 ? 'later' : 'earlier'}).
			</button>
		{/if}
		<button on:click={() => align(0)}>No alignment adjustment.</button>
		<button on:click={promptAlignment}>Enter alignment manually.</button>
	</div>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	export let firstSubtitle = {};

	const dispatch = createEventDispatcher(),
		alignmentKey = 'last-used-alignment',
		lastAlignment = GM_getValue(alignmentKey),
		lastAlignmentSeconds = (lastAlignment / 1000).toFixed(1);

	function useLastAlignment() {
		align(lastAlignment);
	}

	function promptAlignment() {
		const alignment = parseFloat(prompt('Enter an alignment in seconds. Positive numbers mean the subtitles are timed earlier than the video and need to be delayed.', lastAlignmentSeconds));
        if (!isNaN(alignment)) {
        	//alignment needs to be milliseconds
        	align(alignment * 1000);
		}
	}

	function align(alignment) {
		//assume decent reaction time, subtract by a bit so they don't have to perfectly predict
        const video = document.querySelector('video'),
			subOffset = typeof alignment === 'number' ? alignment : video.currentTime * 1000 - firstSubtitle.start - 400;
		GM_setValue(alignmentKey, subOffset);
		dispatch('set-align', subOffset);
	}
</script>
