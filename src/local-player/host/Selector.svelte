<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	a.directory {
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
    a.directory :global(svg) {
		stroke: var(--accent-color);
		height: 1.2rem;
		width: 1.2rem;
	}
    a.directory:hover {
		background: var(--accent-color);
		color: black;
	}
	a.directory:hover :global(svg) {
		stroke: black;
	}
	a.directory :global(svg) {
        display: inline;
		vertical-align: text-bottom;
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
			<a class="directory" href={getRouteToItem(dir)} on:click|preventDefault={() => selectPath(dir)}><Icon name="folder" /> {dir.name}</a>
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