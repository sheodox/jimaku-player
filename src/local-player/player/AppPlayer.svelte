<span class="video-title">{videoTitle}</span>
<span class="video-subtitle">{videoSubtitle}</span>
<Saisei src={videoSrc} />
{#if videoTitle}
	<script src="/subtitler.js"></script>
{/if}

<style>
	.video-title, .video-subtitle {
		display: none;
	}
</style>

<script>
    import {onMount} from 'svelte';
	import viewTimes from '../view-times';
	import Saisei from './Saisei.svelte';

	let videoTitle = '';
	let videoSubtitle = '';
	let videoSrc = decodeURIComponent(location.search.replace(/^\?/, ''));

	onMount(async () => {
		const video = document.querySelector('video');
		if (videoSrc) {
			const videoInfo = await fetch(`/video-info?path=${encodeURIComponent(videoSrc)}`).then(res => res.json());

			videoTitle = videoInfo.history
					//skip the "All Videos" portion, since it'd be in every path
					.slice(1)
					.map(h => h.name)
					.join('/');

			videoSubtitle = videoInfo.selectedVideo.name;

			video.currentTime = viewTimes.get(videoSrc).currentTime;
			setInterval(() => {
				viewTimes.set(videoSrc, video.currentTime, video.duration)
			}, 50);
		}

	});
</script>
