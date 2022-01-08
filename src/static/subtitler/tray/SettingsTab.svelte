<style>
	kbd {
		color: white;
		background: #2f2d2d;
		border: 1px solid #444;
		border-radius: 0.2rem;
		padding: 0 0.2rem;
		font-family: monospace;
	}
	input[type='range']:disabled {
		opacity: 0.3;
	}
	.radio-label {
		display: block;
	}
</style>

<h2>Settings</h2>
<div class="row">
	<label for="subtitle-color">Subtitle fallback color:</label>
	<input type="color" id="subtitle-color" bind:value={$subtitleFallbackColor} />
</div>
<div class="row">
	<input id="show-subs" type="checkbox" bind:checked={$showSubtitlesOnVideo} />
	<label for="show-subs">Show subtitles(<kbd title="Hotkey: h">H</kbd>)</label>
</div>
<div class="row">
	<input id="pause-on-tray" type="checkbox" bind:checked={$pauseWhenTrayOpen} />
	<label for="pause-on-tray">Pause when tray is open</label>
</div>
<div class="row">
	<input id="auto-copy-subtitles" type="checkbox" bind:checked={$autoCopySubtitles} />
	<label for="auto-copy-subtitles">Auto-copy every subtitle to the clipboard </label>
</div>
<div class="row">
	<input id="invert-subtitle-alignment" type="checkbox" bind:checked={$invertVerticalAlignment} />
	<label for="invert-subtitle-alignment">
		Flip subtitle vertical position (<kbd title="Hotkey: i">I</kbd>)
	</label>
</div>
<div class="row">
	<fieldset class="my-2 mx-0">
		<legend> When a subtitle is clicked... </legend>

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
		<br />
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
			<input type="checkbox" bind:checked={$showBasedSettings.overrideGlobalFontScale} />
			Use a different subtitle font size scale for this show
		</label>
	</div>
	{#if $showBasedSettings.overrideGlobalFontScale}
		<div class="row">
			<label>
				This show's subtitle font size scale ({Math.floor($showBasedSettings.fontScale * 100)}%)
				<br />
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

<script lang="ts">
	import { showNameStore } from '../stores/alignment';
	import {
		subtitleFallbackColor,
		showSubtitlesOnVideo,
		pauseWhenTrayOpen,
		invertVerticalAlignment,
		globalFontScale,
		subtitleClickAction,
		autoCopySubtitles,
	} from '../stores/settings';
	import { usesShowBasedSettings, showBasedSettings } from '../stores/by-show-settings';

	const subtitleActionOptions = [
		{ value: 'jisho', name: 'Search on Jisho' },
		{ value: 'copy', name: 'Copy to clipboard' },
		{ value: 'nothing', name: 'Do nothing' },
	];
</script>
