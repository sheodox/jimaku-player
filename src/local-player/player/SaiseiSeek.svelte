<style>
    .seek {
        height: 0.5rem;
        background: var(--muted);
        flex: 1;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
    }
    .played {
        height: 100%;
        background: var(--accent-purple);
    }
    .seek:not(:hover) .thumb {
        opacity: 0;
    }
    .thumb {
        position: absolute;
        transform: translateX(-50%);
        height: 1rem;
        width: 1rem;
        border-radius: 50%;
        background: var(--accent-purple);
        transition: opacity 0.3s;
    }
</style>

<div class="seek" on:click={setValue} bind:this={seekBar}>
    <div class="played" style="width:{trackProgress}"></div>
    <div
        class="thumb"
        role="slider"
        tabindex="0"
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={label}
        style="left:{trackProgress}"
        on:mousedown|stopPropagation={startDragging}
    ></div>
</div>

<svelte:body on:mousemove={e => dragging && setApparentValue(e)} on:mouseup={finishDragging} />

<script>
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();
    export let max;
    export let min = 0;
    export let value;
    export let label;
    let seekBar,
        dragging = false;
    $: trackProgress = (value / max) * 100 + '%';

    function setApparentValue(e) {
        value = Math.min(max, Math.max(0, max * ((e.clientX - seekBar.offsetLeft) / seekBar.offsetWidth)));
    }

    function setValue(e) {
        setApparentValue(e);
        // we could just rely on the bound 'value' change propagating to the video, but svelte is
        // very unreliable when it comes to setting video time based on changing its bound value.
        // saisei will listen for a 'seek' event and set the currentTime directly on the video
        dispatch('seek', value);
    }

    function startDragging(e) {
        dragging = true;
        dispatch('seek-drag-start');
    }

    function finishDragging(e) {
        if (dragging) {
            setValue(e);
            e.stopPropagation();
            dragging = false;
        }
    }
</script>