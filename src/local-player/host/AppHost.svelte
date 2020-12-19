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

	.host {
		flex: 1;
	}
    .everything {
		position: relative;
        flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>

<ThumbnailGhost />
<div class="everything">
    <Header />
	<div class="host f-column">
		<div class="video-player">
			<iframe title="video player" src="/video.html?{encodeURIComponent(selectedVideoInfo.src)}" allowfullscreen></iframe>
			<div class="video-info page-content">
				{#if selectedVideoInfo.name}
					<h2>{selectedVideoInfo.name}</h2>
					<div>
						<button class="icon-button" on:click={scrollToSelectedVideo}>
							<Icon icon="angle-double-down" /> Show in list
						</button>
						<!-- todo: video info and statistics -->
					</div>
				{/if}
			</div>
		</div>


		<div class="page-content">
			<Selector selectedVideoInfo={selectedVideoInfo} />
		</div>
	</div>

	<Footer />
</div>

<script>
	import {onMount} from 'svelte';
	import Selector from './Selector.svelte';
	import page from 'page';
	import {Icon} from 'sheodox-ui';
	import Header from './Header.svelte';
	import Footer from "./Footer.svelte";
	import {videoInfo} from '../videos-store';
	import ThumbnailGhost from "./ThumbnailGhost.svelte";

	//info for the video that's currently playing
	let selectedVideoInfo = {src: '', name: ''};

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

		const info = await fetch(`/video-info?path=${encodeURIComponent(videoSrc)}`).then(res => res.json());
		videoInfo.set(info);

		if (info.selectedVideo) {
			selectedVideoInfo = info.selectedVideo;
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