<style>
	.video-title,
	.video-subtitle {
		display: none;
	}
</style>

<span class="video-title">{videoTitle}</span>
<span class="video-subtitle">{videoSubtitle}</span>
{#if videoInfo}
	<Saisei
		selectedVideo={videoInfo.selectedVideo}
		manifest={videoInfo.manifest}
		resourceBase={videoId.substring(0, videoId.lastIndexOf('/'))}
	/>
	<Subtitler />
{/if}

<script lang="ts">
	import { onMount } from 'svelte';
	import { ManifestFile, VideoInfo } from '../../../shared/types/videos';
	import Saisei from './Saisei.svelte';
	import Subtitler from './Subtitler.svelte';

	let videoTitle = '';
	let videoSubtitle = '';
	//the slug here is a file that points to video's metadata.json file without '-metadata.json'
	let videoId = decodeURIComponent(location.search.replace(/^\?/, ''));
	let manifest: ManifestFile, videoInfo: VideoInfo;

	onMount(async () => {
		if (videoId) {
			videoInfo = await fetch(`/video-info?path=${encodeURIComponent(videoId)}`).then((res) => res.json());
			manifest = videoInfo.manifest;
			if (manifest) {
				// if the video container had subtitle streams that jimaku player supports this puts it
				// somewhere that jimaku player can find and use
				(window as any).jimakuProvidedSubtitles = manifest.subtitles;
				console.log(manifest);
			}

			//on vrv something like this would be the show name, which the jimaku-player subtitler uses
			//to store alignment information for all episodes of the same show, best we can do is file paths
			//to the folder a video is contained in, so at least all the files in there will be the same
			videoTitle = videoInfo.history
				//skip the "All Videos" portion, since it'd be in every path
				.slice(1)
				.map((h) => h.name)
				.join('/');

			videoSubtitle = videoInfo.selectedVideo.name;
		}
	});
</script>
