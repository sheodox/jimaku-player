<style>
    #resume-button {
        width: 100%;
    }
    h3 {
        margin: 0;
    }
</style>

<h2>Start Over</h2>
<div class="row">
    <button on:click={() => dispatch('restart')} class="secondary">
        Reselect subtitles
    </button>
</div>
<h2>Alignment</h2>
<div class="row">
    <p>{$explainedSecondsStore} ({$signedSecondsStore})</p>
</div>
<div class="row">
    <button on:click={() => dispatch('realign')} class="secondary">
        Realign subtitles
    </button>
    <button on:click={() => fineAdjustDialogVisible = true} class="secondary">
        Fine adjustment
    </button>
</div>
{#if $alignmentHistoryStore.length}
    <h3>Switch to a previous alignment</h3>
    {#if $pauseWhenTrayOpen}
        <!-- without a way to resume the video, with this setting on you wouldn't be able to watch for the subtitles changing, the video would be paused -->
        <button id="resume-button" class="secondary" on:click={playVideo}>Resume Video</button>
    {/if}
    <RecentAlignments showPreviews={true} />
{/if}

<script>
    import {createEventDispatcher} from 'svelte';
    import RecentAlignments from "../RecentAlignments.svelte";
    import {signedSecondsStore, explainedSecondsStore} from "../alignmentStore";
    import {pauseWhenTrayOpen} from '../settingsStore';
    import {alignmentHistoryStore} from '../alignmentStore';
    const dispatch = createEventDispatcher();

    export let fineAdjustDialogVisible;

    //used to resume the video while looking at recent subs (so they can watch the recent subs previewing subtitles)
    function playVideo() {
        document.querySelector('video').play();
    }
</script>