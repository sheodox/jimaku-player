<style>
	.settings {
		margin: 1rem;
	}
</style>

<div class="settings">
	<label for="audio-track-select">Audio Track</label>
	<select id="audio-track-select" bind:value={selectedAudioTrackIndex} on:change={switchVideo} disabled={audioTracks.length < 2}>
		{#each audioTracks as track, index}
			<option value={index}>{getTrackTitle(track, index + 1)}</option>
		{/each}
	</select>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	import {getTrackTitle} from "../utils";
	export let selectedAudioTrackIndex;
	export let audioTracks;
	const dispatch = createEventDispatcher();

	function switchVideo() {
		dispatch('switchTrack', selectedAudioTrackIndex);
	}
</script>