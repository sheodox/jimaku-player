<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	button.directory {
        cursor: pointer;
        background: transparent;
        color: var(--accent-color);
		border: 1px solid var(--accent-color);
		font-size: 0.9rem;
		margin: 1rem;
		line-height: 2;
		padding: 0.3rem 1rem;
		border-radius: 1px;
	}
    button.directory :global(svg) {
		stroke: var(--accent-color);
		height: 1.2rem;
		width: 1.2rem;
	}
    button.directory:hover {
		background: var(--accent-color);
		color: black;
	}
	button.directory:hover :global(svg) {
		stroke: black;
	}
	button.directory :global(svg) {
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
			<button class="directory" on:click={() => selectPath(dir)}><Icon name="folder" /> {dir.name}</button>
		{/each}
	</div>
    <div class="videos grid-list">
		{#each videoInfo.videos as item}
			<SelectorVideo isSelected={selectedVideoInfo.src === item.src} videoInfo={item} on:selected={e => selectVideo(e.detail)} />
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

	function selectPath(item) {
		page(`/v/${encodeURIComponent(item.src)}`);
	}
</script>