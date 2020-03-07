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
	.show-name {
		font-style: italic;
	}
</style>
<div class="alignment-buttons">
	<div class="row">
		{#if typeof lastAlignment === 'number'}
			<button on:click={useLastAlignment}>
				Use the last alignment for <span class="show-name">{showName}</span> ({alignmentHint()}).
			</button>
		{/if}
		<button on:click={() => align(0)}>No alignment adjustment.</button>
		<button on:click={promptAlignment}>Enter alignment manually.</button>
	</div>
	<button on:click={align}>
		Click when the first line is said:
		<br />
		<pre>{firstSubtitle.text}</pre>
	</button>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	export let firstSubtitle = {};

	const dispatch = createEventDispatcher(),
		videoTitle = document.querySelector('.video-title'),
		showName = videoTitle ?  videoTitle.textContent : '',
		alignmentKey = `last-used-alignment-${showName}`,
		lastAlignment = GM_getValue(alignmentKey),
		lastAlignmentSeconds = (lastAlignment / 1000).toFixed(1);

	function alignmentHint() {
		return `${Math.abs(lastAlignmentSeconds)} seconds ${lastAlignment > 0 ? 'later' : 'earlier'}`
	}

	function useLastAlignment() {
		align(lastAlignment);
	}

	function promptAlignment() {
		const alignment = parseFloat(prompt('Enter an alignment in seconds. Positive numbers mean the subtitles are timed earlier than the video and need to be delayed.', (lastAlignmentSeconds || '')));
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
