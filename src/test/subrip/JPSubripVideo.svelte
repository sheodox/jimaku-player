<style>
    video {
        height: 100%;
        width: 100%;
    }
</style>
<video controls src="/test/nothing.webm" muted bind:currentTime></video>
<SubRipRenderer {subtitles} />

<script>
    import SubRipRenderer from '../../subtitler/renderers/SubRipRenderer.svelte';
    import {onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import SubRip from '../../subtitler/parsers/SubRip';
    export let currentTime;
    const subtitles = writable([]);

    onMount(async () => {
        const testScript = await fetch('/test/subrip/vtt-test.vtt').then(res => res.text()),
            subs = new SubRip(testScript, 'vtt-test.vtt');
        subtitles.set(subs.getSubs(1000 * currentTime));
    })
</script>
