<span class="video-title">Test Video</span>
<Video src={videoSrc} />

<style>
	.video-title {
		display: none;
	}
</style>

<script>
    import {onMount} from 'svelte';
	import settings from '../settings';
	import Video from './Video.svelte';
	let videoSrc = '';
	onMount(() => {
		const isResuming = settings.get('maintain-time', true),
			timeKey = 'last-video-time',
			lastTime = settings.get(timeKey, 0),
			video = document.querySelector('video'),
			selectedVideoKey = 'selected-video';

		videoSrc = settings.get(selectedVideoKey);

		if (isResuming) {
			video.currentTime = lastTime;
		}
		setInterval(() => {
			settings.set(timeKey, video.currentTime);
		}, 50);

		window.addEventListener('storage', ({key}) => {
			if (key === selectedVideoKey) {
				videoSrc = settings.get(selectedVideoKey);
			}
		});
	})
</script>
