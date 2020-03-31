<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	button {
		cursor: pointer;
		box-shadow: 0 0 2px black;
		background: #273351;
		transition: box-shadow 0.2s;
	}
	button.video {
		border: none;
		padding: 0;
		margin: 1rem;
		color: white;
        transition: box-shadow 0.2s;
		display: flex;
		flex-direction: column;
		max-width: 24rem;
	}
	button.video img {
		flex: 1;
        width: 24rem;
		align-self: center;
	}
	button.selected {
		outline: 1px solid var(--accent-color);
		box-shadow: 0.5rem 0.5rem var(--accent-color);
	}
	button.video:not(.selected) {
		opacity: 0.7;
	}
	button.video:not(.selected):hover {
		opacity: 1;
		color: var(--accent-color);
		outline: 1px solid var(--accent-color);
	}
	button.video:not(.selected):hover .video-title {
		color: var(--accent-color);
	}
	.video-title {
		font-size: 1rem;
        padding: 0.4rem;
		text-align: center;
        margin: 0;
		width: 100%;
	}
	button.directory {
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
    progress {
        -webkit-appearance: none;
		appearance: none;
		width: 90%;
		align-self: center;
		height: 4px;
		margin: 0.5rem 1rem 0;
		border: none;
		background: #111218;
	}
	progress::-webkit-progress-bar {
		background: #111218;
	}
	progress::-moz-progress-bar {
		background: var(--accent-gradient) fixed;
	}
	progress::-webkit-progress-value {
		background: var(--accent-gradient) fixed;
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
			<button class="video" class:selected={selectedVideoInfo.src === item.src} on:click={() => selectVideo(item)}>
				<img src={imageSrc(item.imageKey)} alt="image for {item.name}" />
				<progress value={item.viewTimes.currentTime} max={item.viewTimes.duration}></progress>
				<p class="video-title">
					{item.name}
				</p>
			</button>
		{/each}
	</div>
</div>
<script>
	import page from 'page';
	import Icon from '../Icon.svelte';
	import viewTimes from '../view-times';
	export let videoInfo = {videos: [], directories: [], history: []};
	export let selectedVideoInfo = {src: ''};
	let filteredPath = [],
		filteredDirectories = [],
		filteredVideos = [];

	function imageSrc(imageKey) {
		return `/image/medium/${imageKey}`
	}

	function selectVideo(item) {
		selectPath(item);
		window.scrollTo(0, 0);
	}
	function selectPath(item) {
		page(`/v/${encodeURIComponent(item.src)}`);
	}
</script>