<style>
    iframe, .column-name {
        width: 45vw;
    }
    iframe {
        height: calc(45vw * (9/16));
    }
    .f-column {
        margin: 0 auto;
    }
</style>

<Header pageName="SubRip/WebVTT test" />
<div class="page-content">
    <label>
        <input type="checkbox" bind:checked={$invertVerticalAlignment}>
        Invert vertical alignment (refreshes page)
    </label>
</div>

<div class="f-row">
    <div class="f-column">
        <h2>Native</h2>
        {#each subtitleTimes as time}
            <iframe src="/subrip-test-player.html?currentTime={time}&vanilla=1" title="native vtt demo"/>
        {/each}
    </div>
    <div class="f-column">
        <h2>SubRipRenderer.svelte</h2>
        {#each subtitleTimes as time}
            <iframe src="/subrip-test-player.html?currentTime={time}" title="jimaku player vtt demo"/>
        {/each}
    </div>
</div>

<script>
    import {invertVerticalAlignment} from "../../subtitler/settingsStore";
    import Header from '../../local-player/host/Header.svelte';
    import SubRip from '../../subtitler/parsers/SubRip';
    import {onMount} from "svelte";
    //an array for which each subtitle in the subtitle script will show
    let subtitleTimes = [];

    onMount(async () => {
        const testScript = await fetch('/test/subrip/vtt-test.vtt').then(res => res.text()),
            subs = new SubRip(testScript, 'vtt-test.vtt');
        subs.subs.forEach(sub => {
            subtitleTimes.push(((sub.start + sub.end) / 2) / 1000)
        })
        console.log(subtitleTimes);
        subtitleTimes = subtitleTimes;
    })

    let initialized = false;
    invertVerticalAlignment.subscribe(v => {
        if (initialized) {
            location.reload();
        }
        //refresh, but only when it's changed (the second call of this function)
        initialized = true;
    })
</script>