<style>
    .modal-body {
        padding: 0 1rem 1rem 1rem;
    }
    h2 {
        font-size: 1.1rem;
    }
</style>

<div class="modal-body">
    <h2>Download MPD files</h2>

    <button on:click={() => downloadMpd(metadata.name, metadata.mpd)}>
        <Icon icon="download" />
        Video
    </button>
    {#each metadata.audio as audio}
        <button on:click={() => downloadMpd(getTrackTitle(audio), audio.mpd)}>
            <Icon icon="download" />
            {getTrackTitle(audio)}
        </button>
    {/each}

    {#if metadata.subtitles.length}
        <h2>Download subtitle files</h2>

        {#each metadata.subtitles as subs}
            <button on:click={() => downloadFile(`${getTrackTitle(subs)}.${subs.format}`, 'text/plain', subs.content)}>
                <Icon icon="download" />
                {getTrackTitle(subs)}
            </button>
        {/each}
    {/if}
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import {getTrackTitle, downloadFile} from "../utils";

    export let metadata;

    function downloadMpd(title, mpdText) {
        downloadFile(`${title}.mpd`, 'text/xml', mpdText);
    }
</script>