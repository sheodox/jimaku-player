<style>
	a {
		cursor: pointer;
		box-shadow: 0 0 2px black;
		background: #273351;
		transition: box-shadow 0.2s;
		text-decoration: none;
	}
	a.video {
		border: none;
		padding: 0;
		margin: 1rem;
		color: white;
		transition: box-shadow 0.2s;
		display: flex;
		flex-direction: column;
		max-width: 24rem;
	}
	a.video img {
		flex: 1;
		width: 24rem;
		align-self: center;
	}
	a.selected {
		outline: 1px solid var(--accent-color);
		box-shadow: 0.5rem 0.5rem var(--accent-color);
	}
	a.video:not(.selected) {
		opacity: 0.7;
	}
	a.video:not(.selected):hover {
		opacity: 1;
		color: var(--accent-color);
		outline: 1px solid var(--accent-color);
	}
	a.video:not(.selected):hover .video-title {
		color: var(--accent-color);
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

<a class="video" class:selected={isSelected} href={videoInfo.src} on:click|preventDefault={() => dispatch('selected', videoInfo)}>
	<img src={imageSrc(videoInfo.imageKey)} alt="image for {videoInfo.name}" />
	<progress value={currentTime} max={duration}></progress>
	<p class="video-title">
		{videoInfo.name}
	</p>
</a>
<script>
	import {onMount, onDestroy, createEventDispatcher} from 'svelte';
	const dispatch = createEventDispatcher();
	import viewTimes from '../view-times';

	export let isSelected = false;
	export let videoInfo = {};

	function imageSrc(imageKey) {
		return `/image/medium/${imageKey}`
	}

	let currentTime = 0, duration = 1;
	function renderUpdatedViewTimes() {
		const times = viewTimes.get(videoInfo.src);
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
