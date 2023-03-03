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
	.restart {
		width: 100%;
	}
</style>

<div class="gap-2 mt-2">
	<button class="restart secondary" on:click={() => dispatch('restart')}>Select Different Subtitles</button>
</div>

<h2>Alignment</h2>
<div class="mt-1">
	<p class="muted">Currently {$explainedSecondsStore}</p>
	<p class="fw-bold mb-0 mt-2">The timing is...</p>
	<button on:click={() => (fineAdjustDialogVisible = true)} class="secondary">Almost Correct</button>
	<button on:click={() => dispatch('realign')} class="secondary">Not Even Close</button>
</div>
{#if $alignmentHistoryStore.length}
	<h3 class="sx-font-size-3">Or use a recently used alignment</h3>
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
	import { alignmentHistoryStore, explainedSecondsStore } from '../stores/alignment';
	const dispatch = createEventDispatcher();

	export let fineAdjustDialogVisible: boolean;

	//used to resume the video while looking at recent subs (so they can watch the recent subs previewing subtitles)
	function playVideo() {
		document.querySelector('video').play();
	}
</script>
