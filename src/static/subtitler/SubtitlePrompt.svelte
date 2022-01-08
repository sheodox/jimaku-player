<style>
	.column {
		display: flex;
		flex-direction: column;
	}
	.column > * {
		align-self: center;
		margin: 0.5rem;
	}

	label {
		background: var(--shdx-gray-400);
		transition: background 0.2s;
		border-radius: 0.2rem;
		color: white;
		border: none;
		cursor: pointer;
		padding: 10px;
		line-height: 1;
		font-weight: bold;
		text-transform: uppercase;
		display: inline-block;
		font-size: 1.2rem;
	}
	label:hover {
		background: var(--shdx-gray-300);
	}
	input {
		display: none;
	}
</style>

<div class="column">
	<div class="f-row gap-1">
		<label for="srt-upload">
			<div class="f-row align-items-center">
				<Logo />
				<div class="ml-3">
					<p class="m-0">字幕プレーヤー</p>
					<p class="m-0 shdx-font-size-2">Select a subtitle file to begin</p>
				</div>
			</div>
		</label>
		<input type="file" id="srt-upload" on:change={loadSubtitleFile} accept=".srt,.ass,.ssa,.vtt" />
		<button class="m-0" on:click={cancelSubbing}>Cancel</button>
	</div>

	<!-- if used with the local player some ingested subtitles could be present, offer to use those instead of selecting a file -->
	{#each ingestedSubtitles || [] as providedSubtitles}
		<button class="secondary" on:click={() => loadProvidedSubtitles(providedSubtitles)}>
			{providedSubtitles.title} ({providedSubtitles.language})
		</button>
	{/each}
</div>

<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { ASS } from './parsers/ASS';
	import { SubRip } from './parsers/SubRip';
	import Logo from './Logo.svelte';
	const dispatch = createEventDispatcher();
	import type { ManifestSubtitleTrack } from '../../shared/types/videos';

	let ingestedSubtitles: ManifestSubtitleTrack[], ingestedSubtitlesInterval: ReturnType<typeof setInterval>;

	function loadSubtitleFile(e: Event) {
		const file = (e.target as HTMLInputElement).files[0],
			reader = new FileReader();

		reader.onload = (readEvent) => {
			const extension = file.name.match(/\.(\w{3})$/)[1];
			createSubtitleClass(extension as SubtitleExtension, readEvent.target.result.toString(), file.name);
		};
		reader.readAsText(file);
	}

	function loadProvidedSubtitles(subtitles: ManifestSubtitleTrack) {
		createSubtitleClass(subtitles.format as SubtitleExtension, subtitles.content, subtitles.title, true);
	}

	const constructorClasses = {
		ass: ASS,
		ssa: ASS,
		srt: SubRip,
		vtt: SubRip,
	};
	type SubtitleExtension = keyof typeof constructorClasses;

	function createSubtitleClass(format: SubtitleExtension, content: string, fileName: string, skipAlignment = false) {
		dispatch('subtitles-loaded', {
			//if using provided subtitles they should be aligned at 0, not worth
			//aligning something that came from the video file in the first place.
			skipAlignment,
			subtitles: new constructorClasses[format](content, fileName),
		});
	}

	function cancelSubbing() {
		dispatch('cancel');
	}

	// subtitles from jimaku player ingest won't be available when
	// the subtitler loads, check for them occasionally
	onMount(() => {
		ingestedSubtitlesInterval = setInterval(() => {
			ingestedSubtitles = (window as any).jimakuProvidedSubtitles as ManifestSubtitleTrack[];
		}, 100);
	});
	onDestroy(() => {
		clearInterval(ingestedSubtitlesInterval);
	});
</script>
