<style>
	header {
		background: #2a3450;
		color: white;
		text-align: center;
		border-bottom: 2px solid #42d1f2;
	}

	iframe {
		width: 100%;
		height: 56.25vw;
		max-height: 70vh;
		border: 0;
	}

	h1 {
		margin: 0;
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
		<iframe title="video player" src="video.html" allowfullscreen></iframe>
		<div class="column video-info">
			<h2>{selectedVideoName}</h2>
			<div>
				<input type="checkbox" id="maintain-time" bind:checked={maintainTime}/>
				<label for="maintain-time">Remember video time on refresh</label>
			</div>
		</div>
	</div>


	<div class="column">
		<VideoSelector videos={videos} bind:selectedVideo={selectedVideo} />
	</div>
</div>

<script>
	import {onMount} from 'svelte';
    import settings from '../settings';
    import VideoSelector from './VideoSelector.svelte';

    const keys = {
    	//if the video player resumes from where it left off after refreshing, useful for debugging specific subtitle effects
    	resume: 'resume-at-same-time',
		//which video is being played
		selectedVideo: 'selected-video'
    };
	let videos = [],
		maintainTime = settings.get(keys.resume, true),
		selectedVideo = settings.get(keys.selectedVideo),
		selectedVideoName = '';

	onMount(async () => {
		videos = await fetch('/video-list').then(res => res.json());
		selectedVideo = settings.get(keys.selectedVideo);

		if (!selectedVideo && videos.length) {
			selectedVideo = videos[0].src;
		}
	});

	$: settings.set(keys.resume, maintainTime);
	$: selectVideo(selectedVideo);

	async function selectVideo(path) {
		const video = await fetch(`/video-info?path=${encodeURIComponent(path)}`).then(res => res.json());
		selectedVideoName = video ? video.text : '';
		settings.set(keys.selectedVideo, path);
		window.scrollTo(0, 0);
	}
</script>