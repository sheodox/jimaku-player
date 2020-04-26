<style>
	.column {
		display: flex;
		flex-direction: column;
        text-align: center;
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
    h1 {
		margin: 0;
	}
    h1 {
		font-size: 1.3rem;
		border-bottom: 2px solid #f47521;
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

	/* crunchyroll has a really small viewport sometimes, just shrink everything in that case */
	@media (max-width: 700px) {
		button, input, label, legend {
			font-size: 0.7rem !important;
			margin: 0.2rem;
		}
        .alignment-sign-hint {
			font-size: 0.6rem;
		}
		button {
			padding: 4px;
		}
		h1 {
			font-size: 1rem;
		}
        h2 {
			font-size: 0.9rem;
		}
	}
	h2 {
		margin: 0;
	}
	p {
		align-self: center;
	}
	#subtitle-options {
		max-height: 30vh;
		overflow: auto;
	}
</style>
<div class="column">
	<div class="alignment-panel">
		<button class="small-button secondary" on:click={goBackAPhase}>
			{#if phase === phases.entry}
				&circlearrowleft; Reselect Subtitles
			{:else}
				← Back
			{/if}
		</button>
		<h1>Alignment Adjustment</h1>

		{#if phase === phases.entry}
			<button on:click={useLastAlignment}>
				Use the last alignment
				<!-- if we don't know the show name, then this is just a global alignment, not show specific -->
				{#if showName}
					for <span class="show-name">{showName}</span>
				{/if}
				<br>
				({$explainedSecondsStore})
			</button>
			<h2>Other Recently Used Alignments</h2>
			<RecentAlignments on:aligned={done} />
			<button on:click={() => phase = phases.automatic} class="secondary">
				Choose a different alignment...
			</button>
		{:else if phase === phases.automatic}
			<div class="row">
				<div class="column">
                    <fieldset>
						<legend>Click a button when you hear that line</legend>
						<div id="subtitle-options" class="column">
							{#each reactionSubtitleOptions as option}
								<button on:click={() => alignToSubtitle(option)}>
									{option.text.trim()}
								</button>
							{/each}
						</div>

						<label>
							Not there? Search all subtitles:
							<br>
							<input type="text" bind:value={subtitleSearchText} placeholder="type something you heard">
						</label>
					</fieldset>

					<button on:click={() => phase = phases.manual} class="secondary">Or manually enter an offset...</button>
				</div>
			</div>
		{:else if phase === phases.manual}
			<div class="column">
				<form on:submit|preventDefault={submitManualAlignment} class="column">
					<label for="manual-alignment">Offset subtitle display times (in seconds):</label>
					<div class="row">
						<input type="text" id="manual-alignment" bind:value={manualAlignmentValue} autocomplete="off" on:keydown={manualInputKeydown} use:focusInputOnMount >
						<button>Use this</button>
					</div>
				</form>
				<p class="alignment-sign-hint">
					Positive numbers will delay subtitles.
					Negative numbers will show the subtitles earlier.
				</p>
			</div>
		{/if}
	</div>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	import {get} from 'svelte/store'
	import {
		showNameStore,
		alignmentStore,
		alignmentHistoryStore,
		hasAlignmentStore,
		secondsStore,
		signedSecondsStore,
		explainedSecondsStore,
		saveAlignmentToHistory
	} from './alignmentStore';
	import RecentAlignments from './RecentAlignments.svelte';
	export let subtitles;

	const dispatch = createEventDispatcher(),
		showName = get(showNameStore),
		//all phases as an enum-like variable
		phases = {
			entry: 'entry',
			manual: 'manual',
			automatic: 'automatic'
		};

	let reactionSubtitleOptions = subtitles.getAlignmentCandidates(),
		manualAlignmentValue = get(secondsStore),
		reactionSubtitle = reactionSubtitleOptions[0],
		hasAlignment = get(hasAlignmentStore),
		phase = phases.entry,
		subtitleSearchText = '';

	$: {
		reactionSubtitleOptions = subtitles.getAlignmentCandidates(subtitleSearchText);
	}

	function goBackAPhase() {
		//if we're as far back as the alignment goes, go back to selecting subtitles
		if (phase === phases.entry) {
			dispatch('reselect');
			return;
		}
		//otherwise go back a phase
		phase = phase === phases.automatic ? phases.entry : phases.automatic;
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

	function useLastAlignment() {
		align(get(alignmentStore));
	}

	// if they're going to use the keyboard, it's more than likely going to be to type a manual alignment
	function focusInputOnMount(input) {
		input.focus();
		input.select();
	}

	function alignToSubtitle(sub) {
		reactionSubtitle = sub;
		align();
	}

	function align(alignment) {
		//assume decent reaction time, subtract by a bit so they don't have to perfectly predict
        const video = document.querySelector('video'),
			subOffset = typeof alignment === 'number'
				? alignment
				: video.currentTime * 1000 - reactionSubtitle.start - 400;

		alignmentStore.set(subOffset);
		saveAlignmentToHistory(subOffset);
		done();
	}

	//called when you're finished aligning, so the app goes onto subtitling as normal
	function done() {
		dispatch('done');
	}
</script>
