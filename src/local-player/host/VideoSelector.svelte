<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	button.video {
		background: #4b5266;
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
		box-shadow: 0.5rem 0.5rem #42d1f2;
	}
	button.video:not(.selected) {
		opacity: 0.6;
	}
	button.video:not(.selected):hover {
		opacity: 0.8;
	}
	.video-title {
		font-size: 1.2rem;
	}
	button.directory {
		background: #42d1f2;
		color: black;
		border: none;
		border-radius: 0.2rem;
		font-size: 1.2rem;
		margin: 1rem;
		line-height: 2;
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
	.history a {
		color: #42d1f2;
	}
</style>

<div id="video-list">
	<nav class="history">
        <ul>
			{#if pathHistory.length > 1}
				{#each pathHistory as path}
					<li>
						<a href on:click|preventDefault={() => popHistory(path)}>{path.path}</a>
					</li>
				{/each}
			{/if}
		</ul>
	</nav>
	<div class="directories grid-list">
		{#each filteredDirectories as dir}
			<button class="directory" on:click={() => selectPath(dir.children, dir.path)}>🗀 {dir.path}</button>
		{/each}
	</div>
    <div class="videos grid-list">
		{#each filteredVideos as item}
			<button class="video" class:selected={selectedVideo === item.src} on:click={() => selectedVideo = item.src}>
		<span class="video-title">
			{item.text}
		</span>
				<br>
				<img src={imageSrc(item.imageKey)} alt="image for {item.text}" />
			</button>
		{/each}
	</div>
</div>
<script>
	export let videos = [];
	export let selectedVideo = '';
	let filteredPath = [],
		filteredDirectories = [],
		filteredVideos = [],
		pathHistory = [];

	$: {
		selectPath(videos);
	}

	function imageSrc(imageKey) {
		return `/image/medium/${imageKey}`
	}

	function popHistory(path) {
		pathHistory = pathHistory.slice(0, pathHistory.indexOf(path) + 1);
		selectPath(path.children, false);
	}

	function selectPath(item, pathSegmentName='All Videos') {
		if (item.length === 0) {
			return;
		}
		//if pathSegmentName === false, we're popping history
		if (pathSegmentName) {
			pathHistory.push({
				type: 'directory',
				path: pathSegmentName,
				//save a snapshot of the filtered path
				children: JSON.parse(JSON.stringify(item))
			});
			pathHistory = pathHistory; //trigger svelte change detection
		}
		filteredPath = item;
		filteredDirectories = filteredPath.filter(i => i.type === 'directory');
		filteredVideos = filteredPath.filter(i => i.type === 'video');
	}
</script>