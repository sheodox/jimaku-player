<style>
	#video-list {
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
	}
	button.video img {
		flex: 1;
        max-width: 24rem;
	}
	button.selected {
		box-shadow: 0.5rem 0.5rem #42d1f2;
	}
	button:not(.selected) {
		opacity: 0.6;
	}
	button:not(.selected):hover {
		opacity: 0.8;
	}
	.video-title {
		font-size: 1.2rem;
	}
</style>

<div id="video-list">
	{#each videos as video}
		<button class="video" class:selected={selectedVideo === video.src} on:click={() => selectedVideo = video.src}>
			<span class="video-title">
				{video.text}
			</span>
			<br>
			<img src={imageSrc(video.imageKey)} alt="image for {video.text}" />
		</button>
	{/each}
</div>
<script>
	export let videos = [];
	export let selectedVideo = '';

	function imageSrc(imageKey) {
		return `/image/medium/${imageKey}`
	}
</script>