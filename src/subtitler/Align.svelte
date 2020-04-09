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
    .row button {
		max-width: 15rem;
	}
	.show-name {
		font-style: italic;
	}
</style>
<div class="alignment-buttons">
	<button class="small-button" on:click={() => dispatch('reselect')}>&circlearrowleft; Reselect Subtitles</button>
	<div class="row">
		{#if typeof lastAlignment === 'number' && !isNaN(lastAlignment)}
			<button on:click={useLastAlignment}>
				Use the last alignment
                <!-- if we don't know the show name, then this is just a global remembered alignment, not show specific -->
				{#if showName}
					for <span class="show-name">{showName}</span>
				{/if}
				({alignmentHint()})
			</button>
		{/if}
		<button on:click={() => align(0)}>No alignment adjustment<br />(use when you know the subtitles are timed properly)</button>
		<button on:click={promptAlignment}>Enter alignment manually</button>
	</div>
	<button on:click={align}>
		&rlhar; Click when the first line is said:
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
		lastAlignment = parseInt(GM_getValue(alignmentKey), 10),
		lastAlignmentSeconds = (lastAlignment / 1000).toFixed(1);

	function alignmentHint() {
		if (lastAlignment === 0) {
			return `no adjustment`;
		}
		return lastAlignment > 0
			? `subtitles delayed by ${lastAlignmentSeconds} seconds`
			: `subtitles hastened by ${Math.abs(lastAlignmentSeconds)} seconds`;
	}

	function useLastAlignment() {
		align(lastAlignment);
	}

	function promptAlignment() {
		const alignment = parseFloat(prompt('Enter an alignment in seconds. Positive numbers are for when the subtitles need to be delayed (subtitle file starts too soon). \nNegative numbers will play the subtitles earlier (subtitle file is too late).', (lastAlignmentSeconds || '')));
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
