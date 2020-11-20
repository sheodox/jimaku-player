<div class="column">
	<button class="small-button secondary" on:click={cancelSubbing}>&Cross; Skip Subtitling For This Episode</button>
	<label for="srt-upload">&equiv; Select a subtitle file to begin</label>
	<input type="file" id="srt-upload" on:change={loadSubtitleFile} accept=".srt,.ass,.ssa,.vtt">

	<!-- if used with the local player in, some ingested subtitles could be present, offer to use those instead of selecting a file -->
	{#each (window.jimakuProvidedSubtitles || []) as providedSubtitles}
		<button class="secondary" on:click={() => loadProvidedSubtitles(providedSubtitles)}>
			{providedSubtitles.title} ({providedSubtitles.language})
		</button>
	{/each}
</div>
<script>
	import {createEventDispatcher} from 'svelte';
	import {ASS} from "./parsers/ASS";
	import SubRip from "./parsers/SubRip";
	const dispatch = createEventDispatcher();

	function loadSubtitleFile(e) {
		const file = e.target.files[0],
				reader = new FileReader();
		reader.onload = (readEvent) => {
			const [_, extension] = file.name.match(/\.(\w{3})$/);
			createSubtitleClass(extension, readEvent.target.result, file.name);
		};
		reader.readAsText(file);
	}

	function loadProvidedSubtitles(subtitles) {
		createSubtitleClass(subtitles.format, subtitles.content, subtitles.title, true);
	}

	function createSubtitleClass(format, content, fileName, skipAlignment=false) {
		const constructorClasses = {
			'ass': ASS,
			'ssa': ASS,
			'srt': SubRip,
			'vtt': SubRip
		};
		dispatch('subtitles-loaded', {
			//if using provided subtitles they should be aligned at 0, not worth
			//aligning something that came from the video file in the first place.
			skipAlignment,
			subtitles: new constructorClasses[format](content, fileName)
		})
	}

	function cancelSubbing() {
		dispatch('cancel');
	}
</script>

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
		background: #fd0;
		border: none;
		cursor: pointer;
		padding: 10px;
		line-height: 1;
		font-weight: bold;
		color: black;
		text-transform: uppercase;
		display: inline-block;
		font-size: 1.2rem;
	}
	label:hover {
		background: #ffea6d;
	}
	input {
		display: none;
	}
</style>