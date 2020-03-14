<span class="video-title">Test Video</span>
<Video src={videoSrc} />

<style>
	.video-title {
		display: none;
	}
</style>

<svelte:window on:storage={storageChange} />

<script>
    import {onMount} from 'svelte';
	import settings from '../settings';
	import Video from './Video.svelte';

	const selectedVideoKey = 'selected-video';
	let videoSrc = settings.get(selectedVideoKey);

	onMount(() => {
		const isResuming = settings.get('maintain-time', true),
			timeKey = 'last-video-time',
			lastTime = settings.get(timeKey, 0),
			video = document.querySelector('video'),

		videoSrc = settings.get(selectedVideoKey);

		if (isResuming) {
			video.currentTime = lastTime;
		}
		setInterval(() => {
			settings.set(timeKey, video.currentTime);
		}, 50);

	});

	function storageChange({key}){
		if (key === selectedVideoKey) {
			videoSrc = settings.get(selectedVideoKey);
		}
	}
</script>
