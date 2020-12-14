<style>
	a {
		cursor: pointer;
		box-shadow: 0 0 2px black;
		background: var(--panel-bg);
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
	img, .skeleton {
		flex: 1;
		width: 24rem;
		align-self: center;
	}
    .skeleton {
		min-height: calc(24rem * (9/16));
		background: var(--panel-footer-bg);
	}
	.selected {
		outline: 1px solid var(--accent-blue);
		box-shadow: 0.5rem 0.5rem var(--accent-blue);
	}
	a:not(.selected) {
		opacity: 0.7;
	}
	a:not(.selected):hover {
		opacity: 1;
		color: var(--accent-blue);
		outline: 1px solid var(--accent-blue);
	}
	a:not(.selected):hover .video-title {
		color: var(--accent-blue);
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
		background: var(--accent-gradient) fixed;
	}
	progress::-webkit-progress-value {
		background: var(--accent-gradient) fixed;
	}
</style>

<a class="video" class:selected={isSelected} href={route} on:click|preventDefault={() => page(route)}>
	<img
		src={imageSrc(video.imageKey)}
		alt="image for {video.name}"
		class:hidden={!imageLoaded}
		on:load={() => imageLoaded = true}
	/>
	{#if !imageLoaded}
		<div class="skeleton" />
	{/if}
	<progress value={currentTime} max={duration}></progress>
	<p class="video-title">
		{video.name}
	</p>
</a>
<script>
	import {onMount, onDestroy, createEventDispatcher} from 'svelte';
	import page from 'page';
	const dispatch = createEventDispatcher();
	import viewTimes from '../view-times';

	//if this is the video that's currently playing
	export let isSelected = false;
	//info about this video, src, name, etc
	export let video = {};
	//the route this video is available at
	export let route = '';

	let imageLoaded = false,
		currentTime = 0,
		duration = 1;

	function imageSrc(imageKey) {
		return `/image/medium/${imageKey}`
	}

	function renderUpdatedViewTimes() {
		const times = viewTimes.get(video.src);
		duration = times.duration;
		currentTime = times.currentTime;
	}

	//occasionally update the view times
	let viewTimesUpdateInterval;
	onMount(() => {
		viewTimesUpdateInterval = setInterval(renderUpdatedViewTimes, 10 * 1000);
        renderUpdatedViewTimes();
	});
	onDestroy(() => {
		clearInterval(viewTimesUpdateInterval);
	})
</script>
