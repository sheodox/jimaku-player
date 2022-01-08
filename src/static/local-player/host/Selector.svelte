<style>
	.grid-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	.history a {
		cursor: pointer;
		font-weight: bold;
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
	#video-list {
		/* don't want folders without videos to take up so little space that the page
		gets really short and they have to scroll immediately to see any videos */
		min-height: 30rem;
	}
</style>

<div id="video-list">
	<nav class="history">
		<ol class="f-row justify-content-center has-inline-links">
			{#each $videoInfo.history as path, index}
				<li>
					<a href={path.src} on:click|preventDefault={() => selectPath(path)}>{path.name}</a>
					{#if index !== $videoInfo.history.length - 1}
						<Icon icon="chevron-right" />
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
	<div class="directories grid-list">
		{#each $videoInfo.directories as directory (directory.path)}
			<SelectorDirectory {directory} />
		{/each}
	</div>
	<div class="videos grid-list">
		{#each $videoInfo.videos as video (video.path)}
			<SelectorVideo isSelected={selectedVideoInfo?.path === video.path} route={getRouteToItem(video)} {video} />
		{/each}
	</div>
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import SelectorVideo from './SelectorVideo.svelte';
	import { videoInfo } from '../videos-store';
	import { selectedGhost } from './thumbnail-ghosts';
	import SelectorDirectory from './SelectorDirectory.svelte';
	import { getRouteToItem, selectPath } from './selector-utils';
	import type { VideoMetadata } from '../../../shared/types/videos';

	export let selectedVideoInfo: VideoMetadata;

	$: selectedGhost.set(selectedVideoInfo?.id);
</script>
