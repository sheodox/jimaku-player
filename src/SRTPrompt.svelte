<label for="srt-upload">Select an SRT file to begin</label>
<input type="file" id="srt-upload" on:change={uploadSRT} accept=".srt">
<script>
	import {createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();

	function uploadSRT(e) {
		const file = e.target.files[0],
			reader = new FileReader();
		reader.onload = (readEvent) => {
			dispatch('srt-loaded', readEvent.target.result);
		};
		reader.readAsText(file);
	}
</script>

<style>
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
		margin: 2rem;
	}
	label:hover {
		background: #ffea6d;
	}
	input {
		display: none;
	}
</style>