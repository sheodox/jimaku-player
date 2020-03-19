<span class="video-title">Test Video</span>
<Video src={videoSrc} />

<style>
	.video-title {
		display: none;
	}
</style>

<script>
    import {onMount} from 'svelte';
	import viewTimes from '../view-times';
	import Video from './Video.svelte';


	let videoSrc = decodeURIComponent(location.search.replace(/^\?/, ''));

	onMount(() => {
		const video = document.querySelector('video');

		video.currentTime = viewTimes.get(videoSrc);
		setInterval(() => {
			viewTimes.set(videoSrc, video.currentTime)
		}, 50);

	});
</script>
