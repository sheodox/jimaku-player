<style>
	header {
		background: #2a3450;
		color: white;
		text-align: center;
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
	header svg {
		display: inline-block;
		width: 2.5rem;
		height: 2.5rem;
		vertical-align: text-bottom;
	}
	header h1 {
		display: inline-block;
	}
	.line {
		width: 100%;
		height: 2px;
		background: linear-gradient(to right, var(--accent-color-secondary), var(--accent-color));
	}
	:global(.icon-button) {
		cursor: pointer;
		background: transparent;
		color: var(--accent-color);
		border: 1px solid var(--accent-color);
		font-size: 0.9rem;
		margin: 1rem;
		line-height: 2;
		padding: 0.3rem 1rem;
		border-radius: 1px;
		text-decoration: none;
	}
    :global(.icon-button:hover) {
		background: var(--accent-color);
		color: black;
	}
    :global(.icon-button svg) {
		stroke: var(--accent-color) !important;
		height: 1.2rem;
		width: 1.2rem;
		display: inline;
		vertical-align: text-bottom;
	}
	:global(.icon-button:hover svg) {
		stroke: black !important;
	}
</style>

<header>
	<svg viewbox="0 0 100 100">
		<image xlink:href="/logo.svg"></image>
	</svg>
	<h1>字幕プレーヤー</h1>
	<div class="line"></div>
</header>
<div class="host">
    <div class="video-player">
		<iframe title="video player" src="/video.html?{encodeURIComponent(selectedVideoInfo.src)}" allowfullscreen></iframe>
		<div class="column video-info">
			{#if selectedVideoInfo.name}
				<h2>{selectedVideoInfo.name}</h2>
				<div>
					<button class="icon-button" on:click={scrollToSelectedVideo}>
						<Icon name="chevrons-down" /> Show in list
					</button>
					<!-- todo: video info and statistics -->
				</div>
			{/if}
		</div>
	</div>


	<div class="column">
		<Selector videoInfo={videoInfo} selectedVideoInfo={selectedVideoInfo} />
	</div>
</div>

<script>
	import {onMount} from 'svelte';
	import Selector from './Selector.svelte';
	import page from 'page';
	import Icon from "../Icon.svelte";

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