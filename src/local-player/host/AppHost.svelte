<style>
	iframe {
		width: 100%;
		height: 56.25vw;
		max-height: 70vh;
		border: 0;
	}

	.video-player {
        background: #111218;
	}
	.video-info {
		padding: 0 1rem 1rem 1rem;
	}
	.video-info:empty {
		display: none;
	}
</style>

<Header appName="字幕プレーヤー" slim={true}>
	<svg slot="logo" viewbox="0 0 100 100" id="header-logo">
		<image xlink:href="/logo.svg"></image>
	</svg>
</Header>
<div class="host">
    <div class="video-player">
		<iframe title="video player" src="/video.html?{encodeURIComponent(selectedVideoInfo.src)}" allowfullscreen></iframe>
		<div class="video-info page-content">
			{#if selectedVideoInfo.name}
				<h2>{selectedVideoInfo.name}</h2>
				<div>
					<button class="icon-button" on:click={scrollToSelectedVideo}>
						<Icon icon="read_more" /> Show in list
					</button>
					<!-- todo: video info and statistics -->
				</div>
			{/if}
		</div>
	</div>


	<div class="page-content">
		<Selector videoInfo={videoInfo} selectedVideoInfo={selectedVideoInfo} />
	</div>
</div>

<script>
	import {onMount} from 'svelte';
	import Selector from './Selector.svelte';
	import page from 'page';
	import {Header, Icon} from 'sheodox-ui';

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
		if (!videoSrc) {
			return;
		}

		videoInfo = await fetch(`/video-info?path=${encodeURIComponent(videoSrc)}`).then(res => res.json());

		if (videoInfo.selectedVideo) {
			selectedVideoInfo = videoInfo.selectedVideo;
			document.title = `${selectedVideoInfo.name} - 字幕プレーヤー`;
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});
		}
	}

	function scrollToSelectedVideo() {
		const selectedVideoInList = document.querySelector('.video.selected');
		if (selectedVideoInList) {
			selectedVideoInList.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			})
		}
	}
</script>