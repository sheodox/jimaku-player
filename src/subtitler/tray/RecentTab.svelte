<style>
    .a:hover {
        text-decoration: underline;
    }
    li {
        padding-bottom: 0.2rem;
    }
    #recent-subs li .a {
        white-space: pre;
        background: none;
        color: white;
        text-transform: none;
        font-weight: normal;
        margin: 0;
        padding: 0;
    }
    li:not(:first-of-type)::after {
        content: ' ';
        height: 0;
        position: relative;
        border: 1px solid #4a4a6a;
        display: block;
        margin: 0 auto;
        border-radius: 4px;
    }
    ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column-reverse;
    }
</style>

<ul id="recent-subs">
    {#each recentSubs as sub, i (sub.text)}
        <li in:fly={{y: -50, duration: 200}} out:fly={{y:50, duration: 200}} animate:flip={{duration: 200}}>
            <button class="small-button secondary" on:click={rewindToSubtitle(sub)} title="Rewind to this subtitle">⯇<span class="sr">Rewind to this subtitle</span></button>
            {#if $subtitleClickAction === 'nothing'}
                {(sub.text || '').trim()}
            {:else}
                <button
                    class="a"
                    on:click={() => performSubtitleClickAction(sub.text)}
                >
                    {(sub.text || '').trim()}
                </button>
            {/if}
        </li>
    {/each}
</ul>

<script>
    import {createEventDispatcher} from 'svelte';
    import {fly, fade} from 'svelte/transition';
    import {flip} from 'svelte/animate';
    import {alignmentStore} from "../alignmentStore";
    import {performSubtitleClickAction} from "../renderers/render-common";
    import {subtitleClickAction} from "../settingsStore";

    export let recentSubs;

    const dispatch = createEventDispatcher();

    function rewindToSubtitle(sub) {
        // rewind the video to just a bit before the line is said, less jarring and hides tiny misalignment differences
        document.querySelector('video').currentTime = ((sub.start + $alignmentStore) / 1000) - 0.5;
    }
</script>
