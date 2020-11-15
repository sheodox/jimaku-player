<style>
	.settings {
		margin: 1rem;
	}
</style>

<div class="settings">
	<label for="audio-track-select">Audio Track</label>
	<select id="audio-track-select" bind:value={selectedVideoIndex} on:change={switchVideo} disabled={videos.length < 2}>
		{#each videos as track, index}
			<option value={index}>{getTrackTitle(track, index + 1)}</option>
		{/each}
	</select>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	export let selectedVideoIndex;
	export let videos;
	const dispatch = createEventDispatcher();

	function switchVideo() {
		dispatch('switchVideo', selectedVideoIndex);
	}

	function getTrackTitle(track, trackNumber) {
		const title = (track.title || '') + (track.language ? ` (${track.language})` : '');

		return title || `Audio Track ${trackNumber}`;
	}
</script>