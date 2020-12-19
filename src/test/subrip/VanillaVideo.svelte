<style>
    video {
        height: 100%;
        width: 100%;
    }
</style>
<video src="/test/nothing.webm" muted bind:this={video}>
    <track default kind=captions src="/test/subrip/vtt-test.vtt" />
</video>

<script>
    import {onMount} from "svelte";

    export let currentTime
    let video;
    onMount(() => {
        video.currentTime = currentTime;
        //the subtitles don't seem to show until the video starts playing, get it to start briefly so they show
        video.addEventListener('playing', () => {
            setTimeout(() => {
                video.pause()
            }, 100)

        }, {once: true})

        video.play();
    })
</script>