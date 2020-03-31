<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
    .history ul {
		list-style: none;
		display: flex;
		justify-content: center;
	}
	.history li {
		display: inline-block;
	}
    .history li:not(:last-child)::after {
		content: '→';
		color: #4b5266;
		padding: 0.2rem;
	}
	.history li:last-child a {
		color: white;
		cursor: default;
		text-decoration: none;
	}
	.history a {
		color: var(--accent-color);
		font-size: 1.1rem;
	}
</style>

<div id="video-list">
	<nav class="history">
        <ul>
			{#each videoInfo.history as path}
				<li>
					<a href={path.src} on:click|preventDefault={() => selectPath(path)}>{path.name}</a>
				</li>
			{/each}
		</ul>
	</nav>
	<div class="directories grid-list">
		{#each videoInfo.directories as dir}
			<a class="icon-button" href={getRouteToItem(dir)} on:click|preventDefault={() => selectPath(dir)}><Icon name="folder" /> {dir.name}</a>
		{/each}
	</div>
    <div class="videos grid-list">
		{#each videoInfo.videos as video}
			<SelectorVideo isSelected={selectedVideoInfo.src === video.src} route={getRouteToItem(video)} video={video} on:selected={e => selectVideo(e.detail)} />
		{/each}
	</div>
</div>
<script>
	import page from 'page';
	import Icon from '../Icon.svelte';
	import SelectorVideo from "./SelectorVideo.svelte";

	export let videoInfo = {videos: [], directories: [], history: []};
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