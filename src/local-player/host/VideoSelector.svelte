<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	button {
		cursor: pointer;
		box-shadow: 0 0 5px black;
	}
	button.video {
		background: #2b303e;
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
        max-width: 24rem;
	}
	button.selected {
		outline: 1px solid #42d1f2;
		box-shadow: 0.5rem 0.5rem #42d1f2;
	}
	button.video:not(.selected) {
		opacity: 0.6;
	}
	button.video:not(.selected):hover {
		opacity: 1;
	}
	button.video:not(.selected):hover .video-title {
		color: #42d1f2;
	}
	.video-title {
		font-size: 1rem;
        padding: 0.4rem;
	}
	button.directory {
		background: #2b303e;
		color: white;
		border: none;
		font-size: 1.2rem;
		margin: 1rem;
		line-height: 2;
		transition: background-color 0.1s;
	}
	button.directory:hover {
		background: deeppink;
	}
    .history ul {
		list-style: none;
	}
	.history li {
		display: inline-block;
	}
    .history li:not(:last-child)::after {
		content: '/';
		color: white;
		padding: 0.2rem;
	}
	.history li:last-child a {
		color: #4b5266;
		cursor: default;
	}
	.history a {
		color: #00c3f2;
	}
</style>

<div id="video-list">
	<nav class="history">
        <ul>
			{#if videoInfo.history.length > 1}
				{#each videoInfo.history as path}
					<li>
						<a href={path.src} on:click|preventDefault={() => selectPath(path)}>{path.name}</a>
					</li>
				{/each}
			{/if}
		</ul>
	</nav>
	<div class="directories grid-list">
		{#each videoInfo.directories as dir}
			<button class="directory" on:click={() => selectPath(dir)}>🗀 {dir.name}</button>
		{/each}
	</div>
    <div class="videos grid-list">
		{#each videoInfo.videos as item}
			<button class="video" class:selected={selectedVideoInfo.src === item.src} on:click={() => selectVideo(item)}>
				<img src={imageSrc(item.imageKey)} alt="image for {item.name}" />
				<br>
				<span class="video-title">
					{item.name}
				</span>
			</button>
		{/each}
	</div>
</div>
<script>
	import page from 'page';
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