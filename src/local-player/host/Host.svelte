<style>
	header {
		background: #2a3450;
		color: white;
		text-align: center;
		border-bottom: 2px solid var(--accent-color);
	}

	iframe {
		width: 100%;
		height: 56.25vw;
		max-height: 70vh;
		border: 0;
	}

	h1 {
		margin: 0;
		color: white;
	}

	.video-info {
		padding: 0 1rem 1rem 1rem;
	}

	.video-player {
		background: #111218;
	}

	.column {
		justify-content: center;
		display: flex;
		flex-direction: column;
		max-width: 1300px;
		margin: 0 auto;
	}
</style>

<header>
	<h1>字幕プレーヤー</h1>
</header>
<div class="host">
    <div class="video-player">
		<iframe title="video player" src="/video.html?{encodeURIComponent(selectedVideoInfo.src)}" allowfullscreen></iframe>
		<div class="column video-info">
			<h2>{selectedVideoInfo.name}</h2>
			<div>
				<!-- todo: video info and statistics -->
			</div>
		</div>
	</div>


	<div class="column">
		<VideoSelector videoInfo={videoInfo} selectedVideoInfo={selectedVideoInfo} />
	</div>
</div>

<script>
	import {onMount} from 'svelte';
    import settings from '../settings';
    import VideoSelector from './VideoSelector.svelte';
    import page from 'page';

	let videoInfo = {videos: [], directories: [], history: []},
		//info for the video that's currently playing
		selectedVideoInfo = {src: '', name: ''};

	page('/v/*', async ctx => {
		updateVideoInfoWithSelection(ctx.pathname.replace(/^\/v\//, ''));
	});
	page('*', '/v/videos/');

	onMount(() => {
		page();
	});

	async function updateVideoInfoWithSelection(videoSrc) {
		if (!videoSrc) { return; }

		videoInfo = await fetch(`/video-info?path=${encodeURIComponent(videoSrc)}`).then(res => res.json());
		if (videoInfo.selectedVideo) {
			selectedVideoInfo = videoInfo.selectedVideo;
			document.title = `${selectedVideoInfo.name} - 字幕プレーヤー`;
		}
	}
</script>