<div class="column">
	<button class="small-button" on:click={cancelSubbing}>&Cross; Skip Subtitling For This Episode</button>
	<label for="srt-upload">&equiv; Select a subtitle file to begin</label>
	<input type="file" id="srt-upload" on:change={uploadSRT} accept=".srt,.ass,.ssa,.vtt">
</div>
<script>
	import {createEventDispatcher} from 'svelte';
	import ASS from "./parsers/ASS";
	import SRT from "./parsers/SRT";
	const dispatch = createEventDispatcher();

	function uploadSRT(e) {
		const file = e.target.files[0],
				reader = new FileReader();
		reader.onload = (readEvent) => {
			const constructorClass = {
					'ass': ASS,
					'ssa': ASS,
					'srt': SRT,
					'vtt': SRT
				},
				[_, extension] = file.name.match(/\.(\w{3})$/);

			dispatch('subtitles-loaded', new constructorClass[extension](readEvent.target.result, file.name));
		};
		reader.readAsText(file);
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