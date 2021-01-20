<style>
    a:not(:hover) {
        text-decoration: none;
    }
    li {
        padding-bottom: 0.2rem;
    }
    li a {
        white-space: pre;
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

<h2>Recent Subtitles</h2>
<ul class="recent-subs">
    {#each recentSubs as sub, i (sub.text)}
        <li in:fly={{y: -50, duration: 200}} out:fly={{y:50, duration: 200}} animate:flip={{duration: 200}}>
            <button class="small-button secondary" on:click={rewindToSubtitle(sub)} title="Rewind to this subtitle">⯇<span class="sr">Rewind to this subtitle</span></button>
            <a target="_blank" href={`https://jisho.org/search/${encodeURIComponent(sub.text.trim())}`} rel="noopener noreferrer" on:click={() => dispatch('define-pauser')}>
                {(sub.text || '').trim()}
            </a>
        </li>
    {/each}
</ul>

<script>
    import {createEventDispatcher} from 'svelte';
    import {fly, fade} from 'svelte/transition';
    import {flip} from 'svelte/animate';
    import {alignmentStore} from "../alignmentStore";
    export let recentSubs;

    const dispatch = createEventDispatcher();

    function rewindToSubtitle(sub) {
        // rewind the video to just a bit before the line is said, less jarring and hides tiny misalignment differences
        document.querySelector('video').currentTime = ((sub.start + $alignmentStore) / 1000) - 0.5;
    }
</script>
