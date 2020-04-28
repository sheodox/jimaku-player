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
		max-height: 80vh;
		/* center the panel in a way that doesn't interfere with clicking the background on either side to toggle pause,
		   just letting this be centered within the parent flex container leaves click stealing margins on either side */
		left: 50vw;
		transform: translateX(-50%);
		position: absolute;
	}
	fieldset {
		overflow: auto;
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
	h2 {
		font-size: 0.9rem;
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
		button, input, label, legend, p {
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
		#subtitle-options {
			max-height: 30vh;
		}
	}
	h2 {
		margin: 0;
	}
	p {
		align-self: center;
	}
	.search-match:not(:last-child) {
		margin-bottom: 1rem;
	}
    .search-match legend {
		white-space: pre;
        margin: 0 auto;
	}
    #subtitle-search {
		align-self: center;
		max-width: 100%;
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
			{#if $hasAlignmentStore}
				<button on:click={useLastAlignment}>
					Use the last alignment
					<!-- if we don't know the show name, then this is just a global alignment, not show specific -->
					{#if showName}
						for <span class="show-name">{showName}</span>
					{/if}
					<br>
					({$explainedSecondsStore})
				</button>
			{:else}
            	<p>
					You haven't set an alignment for this show before
				</p>
				<button on:click={() => align(0)}>
					 Assume subtitles are properly timed
				</button>
			{/if}

			<button on:click={() => phase = phases.automatic} class="secondary">
				Choose a different alignment...
			</button>

			{#if $alignmentHistoryStore.length}
				<h2>Other Recently Used Alignments</h2>
				<RecentAlignments on:aligned={done} />
			{/if}
		{:else if phase === phases.automatic}
			<label id="subtitle-search">
				Can't find a line? Search all subtitles:
				<br>
				<input type="text" bind:value={subtitleSearchText} placeholder="type something you heard">
			</label>
			<fieldset>
				<legend>Click a subtitle as soon as you hear it said</legend>
				<div id="subtitle-options" class="column">
					{#if reactionSubtitleOptions.length === 0}
						<p>No subtitles matching "{subtitleSearchText}".</p>
					{/if}
					{#each reactionSubtitleOptions as option}
						{#if option.type === 'search-match'}
							<div class="search-match">
								<fieldset>
									<legend>
										{option.sub.text.trim()}
									</legend>
                                    <div class="column">
										{#each option.subsequent as subsequent}
											<button on:click={() => alignToSubtitle(subsequent)}>
												({subsequent.offset})<br>{subsequent.text.trim()}
											</button>
										{/each}
									</div>
								</fieldset>
							</div>
						{:else}
							<button on:click={() => alignToSubtitle(option)}>
								({option.offset})<br>{option.text.trim()}
							</button>
						{/if}
					{/each}
				</div>
			</fieldset>

			<button on:click={() => phase = phases.manual} class="secondary">Or manually enter an offset...</button>
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
        const video = document.querySelector('video'),
			subOffset = typeof alignment === 'number'
				? alignment
				//assume decent reaction time, subtract by a bit so they don't have to perfectly time it
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
