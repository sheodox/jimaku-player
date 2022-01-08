<style>
	.column {
		display: flex;
		flex-direction: column;
		text-align: center;
		max-width: 30rem;
	}
	button {
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
	#subtitle-list {
		overflow: auto;
	}
	h1 {
		margin: 0;
	}
	h1 {
		font-size: 1.3rem;
	}
	h2 {
		font-size: 0.9rem;
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
		button,
		input,
		label,
		legend,
		p {
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
</style>

<div class="column panel m-3 px-4">
	<div class="f-row align-items-center justify-content-between">
		<h1>Alignment</h1>
		<button class="small" on:click={goBackAPhase}>Back</button>
	</div>

	{#if phase === phases.entry}
		{#if $hasAlignmentStore}
			<button on:click={useLastAlignment} class="primary">
				Last used alignment
				<!-- if we don't know the show name, then this is just a global alignment, not show specific -->
				{#if showName}
					for <span class="show-name">{showName}</span>
				{/if}
				<br />
				({$explainedSecondsStore})
			</button>
		{:else}
			<p>You haven't set an alignment for this show before</p>
			<button on:click={() => align(0)}> Assume subtitles are properly timed </button>
		{/if}

		<button on:click={() => (phase = phases.automatic)} class="secondary"> Choose a different alignment... </button>

		{#if $alignmentHistoryStore.length}
			<h2 class="mt-4">Other Recently Used Alignments</h2>
			<RecentAlignments on:aligned={done} />
		{/if}
		<div class="fw-bold mt-4">
			<ExternalLink href="https://github.com/sheodox/jimaku-player#alignment">What is alignment?</ExternalLink>
		</div>
	{:else if phase === phases.automatic}
		<TextInput bind:value={subtitleSearchText} id="subtitle-search">Subtitle Search</TextInput>
		<div class="mt-3" id="subtitle-list">
			<p>Click a subtitle as soon as you hear it said</p>
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
											({subsequent.offset})<br />{subsequent.text.trim()}
										</button>
									{/each}
								</div>
							</fieldset>
						</div>
					{:else}
						<button on:click={() => alignToSubtitle(option)}>
							({option.offset})<br />{option.text.trim()}
						</button>
					{/if}
				{/each}
			</div>
		</div>

		<button on:click={() => (phase = phases.manual)} class="secondary">Or manually enter an offset...</button>
	{:else if phase === phases.manual}
		<div class="column">
			<form on:submit|preventDefault={submitManualAlignment} class="column">
				<label for="manual-alignment">Subtitle display time offset (in seconds):</label>
				<div class="row">
					<input
						type="text"
						id="manual-alignment"
						bind:value={manualAlignmentValue}
						autocomplete="off"
						on:keydown={manualInputKeydown}
						use:focusInputOnMount
					/>
					<button>Set</button>
				</div>
			</form>
			<p class="alignment-sign-hint">
				The alignment offset is added to the start and end times of every subtitle, so positive numbers will delay
				subtitles and negative numbers will show the subtitles earlier.
			</p>
		</div>
	{/if}
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import ExternalLink from '../local-player/ExternalLink.svelte';
	import {
		showNameStore,
		alignmentStore,
		alignmentHistoryStore,
		hasAlignmentStore,
		secondsStore,
		explainedSecondsStore,
		saveAlignmentToHistory,
	} from './stores/alignment';
	import RecentAlignments from './RecentAlignments.svelte';
	import { TextInput } from 'sheodox-ui';
	import type { SubtitleParser } from './types/subtitles';
	import { SubtitleBase } from './parsers/SubtitleFormat';

	export let subtitles: SubtitleParser;

	const dispatch = createEventDispatcher(),
		showName = get(showNameStore),
		//all phases as an enum-like variable
		phases = {
			entry: 'entry',
			manual: 'manual',
			automatic: 'automatic',
		};

	let reactionSubtitleOptions = subtitles.getAlignmentCandidates(),
		manualAlignmentValue = get(secondsStore),
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

	function manualInputKeydown(e: KeyboardEvent) {
		//don't let these events bubble up, VRV's hotkeys are greedy and arrow keys even in an input
		//will make the video skip around, and the enter key will just pause the video. need to stop
		//the events right here and manually handle submitting the form if enter is pressed
		e.stopPropagation();
		if (e.key === 'Enter') {
			submitManualAlignment();
		}
	}

	function submitManualAlignment() {
		!isNaN(manualAlignmentValue)
			? align(manualAlignmentValue * 1000) //seconds to ms
			: alert('Please enter a valid number!');
	}

	function useLastAlignment() {
		align(get(alignmentStore));
	}

	// if they're going to use the keyboard, it's more than likely going to be to type a manual alignment
	function focusInputOnMount(input: HTMLInputElement) {
		input.focus();
		input.select();
	}

	function alignToSubtitle(sub: SubtitleBase) {
		//assume decent reaction time, subtract by a bit so they don't have to perfectly time it
		align(document.querySelector('video').currentTime * 1000 - sub.start - 400);
	}

	function align(alignment: number) {
		alignmentStore.set(alignment);
		saveAlignmentToHistory(alignment);
		done();
	}

	//called when you're finished aligning, so the app goes onto subtitling as normal
	function done() {
		dispatch('done');
	}
</script>
