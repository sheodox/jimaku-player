<style>
	kbd {
		color: white;
		background: var(--sx-gray-400);
		border-radius: 0.2rem;
		padding: 0 0.2rem;
		font-family: monospace;
		font-size: var(--sx-font-size-2);
	}
	input[type='range']:disabled {
		opacity: 0.3;
	}
	.radio-label {
		display: block;
	}
	.modal-body {
		max-width: 30rem;
	}
</style>

<div class="mt-2">
	<label for="subtitle-color">Subtitle fallback color:</label>
	<input type="color" id="subtitle-color" bind:value={$subtitleFallbackColor} />
</div>
<div>
	<input id="show-subs" type="checkbox" bind:checked={$showSubtitlesOnVideo} />
	<label for="show-subs">Show subtitles(<kbd>Hotkey: h</kbd>)</label>
</div>
<div>
	<input id="pause-on-tray" type="checkbox" bind:checked={$pauseWhenTrayOpen} />
	<label for="pause-on-tray">Pause when tray is open</label>
</div>
<div>
	<input id="auto-copy-subtitles" type="checkbox" bind:checked={$autoCopySubtitles} />
	<label for="auto-copy-subtitles">Auto-copy every subtitle to the clipboard </label>
</div>
<div>
	<input id="invert-subtitle-alignment" type="checkbox" bind:checked={$invertVerticalAlignment} />
	<label for="invert-subtitle-alignment">
		Flip subtitle vertical position (<kbd>Hotkey: i</kbd>)
	</label>
</div>
<div>
	<Fieldset fieldsetClasses="my-2 mx-0" legend="When a subtitle is clicked...">
		<p>
			<kbd>Hotkey: a</kbd>
		</p>
		{#each subtitleActionOptions as action}
			<div class="f-row">
				<label class="radio-label">
					<input type="radio" bind:group={$subtitleClickAction} value={action.value} />
					{action.name}
				</label>
				{#if action.href}
					<ExternalLink href={action.href} classes="ml-1 sx-font-size-2">({action.linkText})</ExternalLink>
				{/if}
			</div>
		{/each}
	</Fieldset>
</div>
<div>
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
<div class="f-row">
	<Fieldset fieldsetClasses="my-2 mx-0" legend="Video Aspect Ratio">
		<div class="f-row justify-space-between align-items-center">
			<div class="f-1">
				{#each aspectRatioOptions as action}
					<label class="radio-label">
						<input
							type="radio"
							bind:group={$aspectRatio}
							value={action.value}
							disabled={$showBasedSettings.overrideGlobalAspectRatio}
						/>
						{action.name}
					</label>
				{/each}
			</div>
			<button on:click={() => (showAspectHelp = true)}>About Aspect Ratios</button>
		</div>
	</Fieldset>
</div>
{#if $usesShowBasedSettings}
	<h3>Settings for {$showNameStore}</h3>
	<div class="f-row">
		<label>
			<input type="checkbox" bind:checked={$showBasedSettings.overrideGlobalFontScale} />
			Use a different subtitle font size scale for this show
		</label>
	</div>
	{#if $showBasedSettings.overrideGlobalFontScale}
		<div class="f-row">
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
	<div class="f-row">
		<label>
			<input type="checkbox" bind:checked={$showBasedSettings.overrideGlobalAspectRatio} />
			Use a different aspect ratio for this show
		</label>
	</div>
	{#if $showBasedSettings.overrideGlobalAspectRatio}
		<div class="f-row">
			<Fieldset fieldsetClasses="my-2 mx-0" legend="Video Aspect Ratio">
				{#each aspectRatioOptions as action}
					<label class="radio-label">
						<input type="radio" bind:group={$showBasedSettings.aspectRatio} value={action.value} />
						{action.name}
					</label>
				{/each}
			</Fieldset>
		</div>
	{/if}
{/if}

{#if showAspectHelp}
	<Modal bind:visible={showAspectHelp} title="Aspect Ratio Help">
		<div class="modal-body">
			<p>
				Aspect Ratio is the ratio of a video's width to height. The <strong>"16:9"</strong> aspect ratio is typically
				called "widescreen" and it's the most common one you'll see. Older stuff was <strong>"4:3"</strong> and typically
				called "fullscreen" and is more square.
			</p>
			<p>
				Jimaku Player has support for both sizes so your subtitles don't extend beyond the sides of the video. If you're
				using subtitles in the <em>ASS format</em> the <strong>Auto</strong> aspect ratio can figure out the right aspect
				ratio from the subtitles or use 16:9 otherwise. You can choose to force it to use either 16:9 or 4:3 if you prefer.
			</p>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { Modal, Fieldset } from 'sheodox-ui';
	import { showNameStore } from '../stores/alignment';
	import {
		subtitleFallbackColor,
		showSubtitlesOnVideo,
		pauseWhenTrayOpen,
		invertVerticalAlignment,
		globalFontScale,
		subtitleClickAction,
		autoCopySubtitles,
		aspectRatio,
	} from '../stores/settings';
	import { usesShowBasedSettings, showBasedSettings } from '../stores/by-show-settings';
	import ExternalLink from '../../local-player/ExternalLink.svelte';

	let showAspectHelp = false;

	const subtitleActionOptions = [
			{ value: 'jisho', name: 'Search on Jisho' },
			{ value: 'copy', name: 'Copy to clipboard' },
			{
				value: 'context.reviews',
				name: 'Save to Context.Reviews',
				href: 'https://context.reviews',
				linkText: 'About',
			},
			{ value: 'nothing', name: 'Do nothing' },
		],
		aspectRatioOptions = [
			{ value: 'auto', name: 'Auto' },
			{ value: '16:9', name: '16:9' },
			{ value: '4:3', name: '4:3' },
		];
</script>
