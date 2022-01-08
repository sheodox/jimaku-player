<style>
	.name {
		font-size: 1.5rem;
	}
	p {
		margin: 0;
	}
</style>

<a class="button" href={getRouteToItem(directory)} on:click|preventDefault={() => selectPath(directory)}>
	<p class="name">
		{directory.name}
	</p>
	<p class="video-count muted">
		{#if directory.containedDirectories > 0}
			<Icon icon="folder" variant="icon-only" />
			{directory.containedDirectories} <span class="sr-only">Directories</span>
		{/if}
		<Icon icon="film" variant="icon-only" />
		{directory.containedVideos} <span class="sr-only">Videos</span>
	</p>
</a>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { getRouteToItem, selectPath } from './selector-utils';
	import type { DirectoryMetadata } from '../../../shared/types/videos';

	export let directory: DirectoryMetadata;
</script>
