<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	.history li:last-child a {
		color: white;
		cursor: default;
		text-decoration: none !important;
		border-color: transparent !important;
	}
	.history a:last-of-type {
		font-size: 1.1rem;
	}
	.directories a {
		margin: 0.5rem;
	}
</style>

<div id="video-list">
	<nav class="history">
        <ol class="f-row justify-content-center">
			{#each $videoInfo.history as path, index}
				<li>
					<a href={path.src} on:click|preventDefault={() => selectPath(path)}>{path.name}</a>
					{#if index !== $videoInfo.history.length - 1}
						<Icon icon="keyboard_arrow_right" />
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
	<div class="directories grid-list">
		{#each $videoInfo.directories as dir (dir.src)}
			<a class="button" href={getRouteToItem(dir)} on:click|preventDefault={() => selectPath(dir)}><Icon icon="folder" /> {dir.name}</a>
		{/each}
	</div>
    <div class="videos grid-list">
		{#each $videoInfo.videos as video (video.src)}
			<SelectorVideo isSelected={selectedVideoInfo.src === video.src} route={getRouteToItem(video)} video={video} on:selected={e => selectVideo(e.detail)} />
		{/each}
	</div>
</div>
<script>
	import page from 'page';
	import {Icon} from 'sheodox-ui';
	import SelectorVideo from "./SelectorVideo.svelte";
	import {videoInfo} from "../videos-store";

	export let selectedVideoInfo = {src: ''};

	function selectVideo(item) {
		selectPath(item);
		window.scrollTo(0, 0);
	}

	function getRouteToItem(item) {
		return `/v/${encodeURIComponent(item.src)}`
	}

	function selectPath(item) {
		page(getRouteToItem(item));
	}
</script>