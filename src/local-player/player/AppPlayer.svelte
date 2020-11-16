<span class="video-title">{videoTitle}</span>
<span class="video-subtitle">{videoSubtitle}</span>
{#if metadata}
	<Saisei {metadata} resourceBase={videoSlug.substring(0, videoSlug.lastIndexOf('/'))} />
	<script src="/subtitler.js"></script>
{/if}

<style>
	.video-title, .video-subtitle {
		display: none;
	}
</style>

<script>
    import {onMount} from 'svelte';
	import Saisei from './Saisei.svelte';

	let videoTitle = '';
	let videoSubtitle = '';
	//the slug here is a file that points to video's metadata.json file without '-metadata.json'
	let videoSlug = decodeURIComponent(location.search.replace(/^\?/, ''));
	let metadata;

	onMount(async () => {
		if (videoSlug) {
			const videoInfo = await fetch(`/video-info?path=${encodeURIComponent(videoSlug)}`).then(res => res.json());
			metadata = videoInfo.metadata;
			window.jimakuProvidedSubtitles = metadata.subtitles;
			console.log(metadata);

			//on vrv something like this would be the show name, which the jimaku-player subtitler uses
			//to store alignment information for all episodes of the same show, best we can do is file paths
			//to the folder a video is contained in, so at least all the files in there will be the same
			videoTitle = videoInfo.history
				//skip the "All Videos" portion, since it'd be in every path
				.slice(1)
				.map(h => h.name)
				.join('/');

			videoSubtitle = videoInfo.selectedVideo.name;
		}

	});
</script>
