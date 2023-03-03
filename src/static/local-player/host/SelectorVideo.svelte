<style>
	a {
		cursor: pointer;
		box-shadow: 0 0 2px black;
		background: var(--sx-gray-500);
		transition: box-shadow 0.2s;
		text-decoration: none;
		border: none;
		padding: 0;
		margin: 1rem;
		color: white;
		display: flex;
		flex-direction: column;
		max-width: 24rem;
	}
	img,
	.skeleton {
		flex: 1;
		width: 24rem;
		align-self: center;
	}
	.skeleton {
		min-height: calc(24rem * (9 / 16));
		background: var(--sx-gray-600);
	}
	.selected {
		outline: 1px solid var(--sx-accent-blue);
		box-shadow: 0.5rem 0.5rem var(--sx-accent-blue);
	}
	a:not(.selected) {
		opacity: 0.7;
	}
	a:not(.selected):hover {
		opacity: 1;
		color: var(--sx-accent-blue);
		outline: 1px solid var(--sx-accent-blue);
	}
	a:not(.selected):hover .video-title {
		color: var(--sx-accent-blue);
	}
	.video-title {
		font-size: 1rem;
		padding: 0.4rem;
		text-align: center;
		margin: 0;
		width: 100%;
	}
	progress {
		-webkit-appearance: none;
		appearance: none;
		width: 90%;
		align-self: center;
		height: 4px;
		margin: 0.5rem 1rem 0;
		border: none;
		background: #111218;
	}
	progress::-webkit-progress-bar {
		background: #111218;
	}
	progress::-moz-progress-bar {
		background: var(--sx-accent-gradient) fixed;
	}
	progress::-webkit-progress-value {
		background: var(--sx-accent-gradient) fixed;
	}
</style>

<a class="video" class:selected={isSelected} href={route} on:click|preventDefault={() => page(route)}>
	<img src={imageSrc} alt="image for {video.name}" class:hidden={!imageLoaded} on:load={() => (imageLoaded = true)} />
	{#if !imageLoaded}
		<div class="skeleton" />
	{/if}
	<progress value={currentTime} max={duration} />
	<p class="video-title">
		{video.name}
	</p>
</a>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import page from 'page';
	import viewTimes from '../view-times';
	import type { VideoMetadata } from '../../../shared/types/videos';

	//if this is the video that's currently playing
	export let isSelected = false;
	//info about this video, src, name, etc
	export let video: VideoMetadata;
	//the route this video is available at
	export let route = '';

	const imageSrc = `/thumbnails/${video.id}/medium`;

	let imageLoaded = false,
		currentTime = 0,
		duration = 1;

	function renderUpdatedViewTimes() {
		const times = viewTimes.get(video.path);
		duration = times.duration;
		currentTime = times.currentTime;
	}

	//occasionally update the view times
	let viewTimesUpdateInterval: ReturnType<typeof setInterval>;
	onMount(() => {
		viewTimesUpdateInterval = setInterval(renderUpdatedViewTimes, 10 * 1000);
		renderUpdatedViewTimes();
	});
	onDestroy(() => {
		clearInterval(viewTimesUpdateInterval);
	});
</script>
