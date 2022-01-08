<style>
	#resume-button {
		width: 100%;
		margin: 0;
	}
	h3 {
		margin: 0;
	}
	button {
		margin: 0;
	}
	hr {
		border-color: var(--shdx-gray-300);
	}
</style>

<h2>Start Over</h2>
<div class="row gap-2">
	<button on:click={() => dispatch('restart')} class="secondary">Reselect Subtitles</button>
	<button on:click={() => dispatch('realign')} class="secondary">Redo Alignment</button>
</div>

<hr class="my-4" />

<h2>Alignment Adjustment</h2>
<div class="row mt-1">
	<button on:click={() => (fineAdjustDialogVisible = true)} class="secondary">Fine Adjustment</button>
</div>
{#if $alignmentHistoryStore.length}
	<h3>Other recently used alignments</h3>
	{#if $pauseWhenTrayOpen}
		<!-- without a way to resume the video, with this setting on you wouldn't be able to watch for the subtitles changing, the video would be paused -->
		<button id="resume-button" class="secondary" on:click={playVideo}>Resume Video</button>
	{/if}
	<div class="mt-2">
		<RecentAlignments showPreviews={true} />
	</div>
{/if}

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import RecentAlignments from '../RecentAlignments.svelte';
	import { pauseWhenTrayOpen } from '../stores/settings';
	import { alignmentHistoryStore } from '../stores/alignment';
	const dispatch = createEventDispatcher();

	export let fineAdjustDialogVisible: boolean;

	//used to resume the video while looking at recent subs (so they can watch the recent subs previewing subtitles)
	function playVideo() {
		document.querySelector('video').play();
	}
</script>
