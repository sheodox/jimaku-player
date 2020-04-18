<style>
	.column {
		display: flex;
		flex-direction: column;
	}
	button {
		margin: 0.5rem;
		align-self: center;
		max-width: 20rem;
	}
	.row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-content: center;
	}
	.row button {
		max-width: 15rem;
	}
	.show-name {
		font-style: italic;
	}
	.alignment-panel {
		background: rgba(27, 26, 38, 0.9);
		align-self: center;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		border-radius: 4px;
		justify-content: center;
	}
	.alignment-panel > :not(select):not(button) {
		color: white;
	}
    h1, h2 {
		margin: 0;
	}
    h1 {
		font-size: 1.3rem;
		border-bottom: 2px solid #f47521;
	}
    h2 {
		font-size: 1.1rem;
		border-bottom: 2px solid #733a12;
		margin-bottom: 0.2rem;
	}
	.alternate-alignment-choice + .alternate-alignment-choice {
		/* draw a line separating the columns */
		margin-left: 0.5rem;
		padding-left: 0.5rem;
		border-left: 1px solid white;
	}
	p, label {
		max-width: 14rem;
	}
	.alignment-sign-hint {
        font-size: 0.8rem;
	}
    #manual-alignment {
		width: 5rem;
		align-self: center;
	}
    .alternate-alignment-choice:not(:hover) {
		opacity: 0.6;
	}

	/* crunchyroll has a really small viewport sometimes, just shrink everything in that case */
	@media (max-width: 700px) {
		button, input, label, pre {
			font-size: 0.7rem !important;
		}
        .alignment-sign-hint {
			font-size: 0.6rem;
		}
		button {
			padding: 4px;
		}
	}

	#reaction-subtitle-chooser {
		position: relative;
		cursor: pointer;
	}
	#reaction-subtitle-chooser pre, span {
		align-self: center;
		pointer-events: none;
	}
	#reaction-subtitle-chooser span {
		margin-left: 1rem;
	}
	#reaction-subtitle-chooser pre {
		z-index: 1;
		position: relative;
		margin: 0;
		font-size: 1.1rem;
	}
	#reaction-subtitle-chooser select {
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
	}

</style>
<div class="column">
	<div class="alignment-panel">
		{#if phase === phases.lastAlignment || !hasLastAlignment}
			<button class="small-button secondary" on:click={() => dispatch('reselect')}>&circlearrowleft; Reselect Subtitles</button>
		{:else}
			<button class="small-button secondary" on:click={() => phase = phases.lastAlignment}>← Back</button>
		{/if}
		<h1>Alignment Adjustment</h1>

		{#if phase === phases.lastAlignment}
			<button on:click={useLastAlignment}>
				Use the last alignment
				<!-- if we don't know the show name, then this is just a global alignment, not show specific -->
				{#if showName}
					for <span class="show-name">{showName}</span>
				{/if}
				<br>
				({alignmentHint()})
			</button>
			<button on:click={() => phase = phases.alternatives} class="secondary">
				Choose a different alignment...
			</button>
		{:else if phase === phases.alternatives}
			<div class="row">
				<div class="column alternate-alignment-choice">
                    <h2>Manual Timing</h2>
					<form on:submit|preventDefault={submitManualAlignment} class="column">
						<label for="manual-alignment">Offset subtitle display times (in seconds):</label>
						<div class="row">
							<input type="text" id="manual-alignment" bind:value={manualAlignmentValue} autocomplete="off" on:keydown={manualInputKeydown}>
							<button>Use this</button>
						</div>
					</form>
					<p class="alignment-sign-hint">
						Positive numbers will delay subtitles.
						Negative numbers will show the subtitles earlier.
					</p>
				</div>
				<div class="column alternate-alignment-choice">
					<h2>Automatic Timing</h2>
					<div id="reaction-subtitle-chooser">
                        <div class="selection-preview row button secondary">
							<div class="column">
								<pre>{reactionSubtitle.text}</pre>
							</div>
                            <span class="column">
								▼
							</span>
						</div>
						<label for="reaction-subtitle-choice" class="sr">Select a subtitle to align against</label>
						<select id="reaction-subtitle-choice" bind:value={reactionSubtitle}>
							{#each reactionSubtitleOptions as option}
								<option value={option}>
									{option.text.trim()}
								</option>
							{/each}
						</select>
					</div>

					<button on:click={align}>
						Play the video and click here when the selected line is said
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	export let subtitles;

	const dispatch = createEventDispatcher(),
		videoTitle = document.querySelector('.video-title'),
		showName = videoTitle ?  videoTitle.textContent : '',
		alignmentKey = `last-used-alignment-${showName}`,
		lastAlignment = parseInt(GM_getValue(alignmentKey), 10),
		hasLastAlignment = !isNaN(lastAlignment),
		lastAlignmentSeconds = (lastAlignment / 1000).toFixed(2),
		reactionSubtitleOptions = subtitles.getAlignmentCandidates(),
		alignmentSignHint = '',
		phases = {lastAlignment: 'last-alignment', alternatives: 'alternatives'};

	let manualAlignmentValue = hasLastAlignment ? lastAlignmentSeconds : 0,
		reactionSubtitle = reactionSubtitleOptions[0],
		phase = hasLastAlignment ? phases.lastAlignment : phases.alternatives;

	function goBackAPhase() {
		//if we're as far back as the alignment goes, go back to selecting subtitles
		if (phase === phases.lastAlignment || !hasLastAlignment) {
			dispatch('reselect')
		}
		//otherwise go back a phase
		else {
			phase = phases.lastAlignment;
		}
	}

	function manualInputKeydown(e) {
		//don't let these events bubble up, VRV's hotkeys are greedy and arrow keys even in an input
		//will make the video skip around, and the enter key will just pause the video. need to stop
		//the events right here and manually handle submitting the form if enter is pressed
		e.stopPropagation();
		if (e.key === 'Enter') {
			submitManualAlignment();
		}
	}

	function submitManualAlignment() {
		const num = parseFloat(manualAlignmentValue);
		!isNaN(num)
			? align(num * 1000) //seconds to ms
			: alert('Please enter a valid number!');
	}

	function alignmentHint() {
		if (lastAlignment === 0) {
			return `no adjustment`;
		}
		return lastAlignment > 0
			? `delayed by ${lastAlignmentSeconds} seconds`
			: `hastened by ${Math.abs(lastAlignmentSeconds)} seconds`;
	}

	function useLastAlignment() {
		align(lastAlignment);
	}

	function align(alignment) {
		//assume decent reaction time, subtract by a bit so they don't have to perfectly predict
        const video = document.querySelector('video'),
			subOffset = typeof alignment === 'number'
				? alignment
				: video.currentTime * 1000 - reactionSubtitle.start - 400;

		GM_setValue(alignmentKey, subOffset);
		dispatch('set-align', subOffset);
	}
</script>
