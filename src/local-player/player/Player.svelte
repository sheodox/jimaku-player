<span class="video-title">{videoTitle}</span>
<Video src={videoSrc} />
{#if videoTitle}
	<script src="/subtitler.js"></script>
	<script>
		console.log("Subtitler App", document.querySelector('.subtitles-app'));
	</script>
{/if}

<style>
	.video-title {
		display: none;
	}
</style>

<script>
    import {onMount} from 'svelte';
	import viewTimes from '../view-times';
	import Video from './Video.svelte';

	let videoTitle = '';
	let videoSrc = decodeURIComponent(location.search.replace(/^\?/, ''));

	onMount(async () => {
		const video = document.querySelector('video');
		if (videoSrc) {
			const videoInfo = await fetch(`/video-info?path=${encodeURIComponent(videoSrc)}`).then(res => res.json());

			videoTitle = videoInfo.history
					.map(h => h.name)
					.join('/');

			video.currentTime = viewTimes.get(videoSrc).currentTime;
			setInterval(() => {
				viewTimes.set(videoSrc, video.currentTime, video.duration)
			}, 50);
		}

	});
</script>
