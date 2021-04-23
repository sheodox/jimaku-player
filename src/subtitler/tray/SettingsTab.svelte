<style>
    dt {
        font-weight: bold;
    }
    dd {
        font-style: italic;
    }
    kbd {
        color: white;
        background: #2f2d2d;
        border: 1px solid #444;
        border-radius: 0.2rem;
        padding: 0 0.2rem;
        font-family: monospace;
    }
    .muted {
        color: #5b5c6f;
    }
    summary {
        cursor: pointer;
    }
    input[type=range]:disabled {
        opacity: 0.3;
    }
    .radio-label {
        display: block;
    }
    fieldset {
        margin: 0.2rem;
    }
</style>

<h2>Settings</h2>
<div class="row">
    <label for="subtitle-color">Subtitle fallback color:</label>
    <input type="color" id="subtitle-color" bind:value={$subtitleFallbackColor}>
</div>
<div class="row">
    <input id="show-subs" type="checkbox" bind:checked={$showSubtitlesOnVideo}>
    <label for="show-subs">Show subs over video (<kbd title="Hotkey: h">H</kbd>)</label>
</div>
<div class="row">
    <input id="pause-on-tray" type="checkbox" bind:checked={$pauseWhenTrayOpen}>
    <label for="pause-on-tray">Pause when tray is open</label>
</div>
<div class="row">
    <input id="auto-copy-subtitles" type="checkbox" bind:checked={$autoCopySubtitles}>
    <label for="auto-copy-subtitles">Auto-copy current subtitles
        <span class="muted">This will copy the current subtitles to your clipboard whenever they change.</span>
    </label>
</div>
<div class="row">
    <input id="invert-subtitle-alignment" type="checkbox" bind:checked={$invertVerticalAlignment}>
    <label for="invert-subtitle-alignment">
        Invert subtitle vertical alignment (<kbd title="Hotkey: i">I</kbd>) <span class="muted">(i.e. if subtitles should be near the bottom this will make them show near the top).
					You'll likely want this enabled if you intend to watch with VRV's subtitles at the same time.</span>
    </label>
</div>
<div class="row">
    <fieldset>
        <legend>
            What should happen when a subtitle is clicked
        </legend>

        {#each subtitleActionOptions as action}
            <label class="radio-label">
                <input type="radio" bind:group={$subtitleClickAction} value={action.value} />
                {action.name}
            </label>
        {/each}
    </fieldset>
</div>
<div class="row">
    <label>
        Subtitle font size scale ({Math.floor($globalFontScale * 100)}%)
        <br>
        <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            disabled={$showBasedSettings && $showBasedSettings.overrideGlobalFontScale}
            bind:value={$globalFontScale}
        />
    </label>
</div>
{#if $usesShowBasedSettings}
    <h3>Settings for {$showNameStore}</h3>
    <div class="row">
        <label>
            <input type="checkbox" bind:checked={$showBasedSettings.overrideGlobalFontScale}>
            Use a different subtitle font size scale for this show
        </label>
    </div>
    {#if $showBasedSettings.overrideGlobalFontScale}
        <div class="row">
            <label>
                This show's subtitle font size scale ({Math.floor($showBasedSettings.fontScale * 100)}%)
                <br>
                <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    disabled={!$showBasedSettings.overrideGlobalFontScale}
                    bind:value={$showBasedSettings.fontScale}
                />
            </label>
        </div>
    {/if}
{/if}

<h3>
    About
</h3>
<details>
    <summary>Debug Information</summary>
    <dl>
        <dt>Subtitles File</dt>
        <dd>{subtitles.fileName}</dd>

        <dt>Alignment</dt>
        <dd>{$explainedSecondsStore} ({$signedSecondsStore})</dd>

        {#each subtitles.debugInfo() as info}
            <dt>{info.title}</dt>
            <dd>{info.detail}</dd>
        {/each}
    </dl>
    <div class="row">
        <button on:click={() => downloadParsedSubtitles()}>⬇ Download parsed subtitles</button>
    </div>
    <div class="row">
        <button on:click={() => downloadParsedSubtitles($subtitleTime)}>⬇ Download currently visible parsed subtitles</button>
    </div>
</details>

<div class="row">
    <a target="_blank" href="https://github.com/sheodox/jimaku-player/issues" rel="noopener noreferrer">Issue? Report it here!</a>
</div>

<script>
    import {
        explainedSecondsStore,
        signedSecondsStore,
        showNameStore
    } from '../alignmentStore';
    import {subtitleTime} from "../subtitleTimer";
    import {
        subtitleFallbackColor,
        showSubtitlesOnVideo,
        pauseWhenTrayOpen,
        invertVerticalAlignment,
        globalFontScale,
        subtitleClickAction,
        autoCopySubtitles
    } from '../settingsStore';
    import {
        usesShowBasedSettings,
        showBasedSettings
    } from "../by-show-settings";

    export let subtitles;

    const subtitleActionOptions = [
        {value: 'jisho', name: 'Search on Jisho'},
        {value: 'copy', name: 'Copy to clipboard'},
        {value: 'nothing', name: 'Do nothing'}
    ]

    function downloadParsedSubtitles(atTime) {
        const a = document.createElement('a'),
            downloadBlob = new Blob([subtitles.serialize(atTime)], {type: 'application/json'});
        a.download = 'parsed-subtitles.json';
        a.href = URL.createObjectURL(downloadBlob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
</script>
