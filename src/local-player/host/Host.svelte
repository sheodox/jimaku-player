<div class="column">
    <h1>VRV Subtitler</h1>
	<h2>{selectedVideo}</h2>
	<iframe title="video player" src="video.html" allowfullscreen></iframe>

	<div>
		<input type="checkbox" id="maintain-time" bind:checked={maintainTime}/>
		<label for="maintain-time">Remember video time on refresh</label>

		<br>

		<label for="video-select">Select a video:</label>
		<select id="video-select" bind:value={selectedVideo}>
			{#each videos as video}
				<option value={video.src} selected={selectedVideo === video.text}>{video.text}</option>
			{/each}
		</select>
	</div>
</div>
<script>
	import {onMount} from 'svelte';
    import settings from '../settings';

    const keys = {
    	//if the video player resumes from where it left off after refreshing, useful for debugging specific subtitle effects
    	resume: 'resume-at-same-time',
		//which video is being played
		selectedVideo: 'selected-video'
    };
	let videos = [],
		maintainTime = settings.get(keys.resume, true),
		selectedVideo = settings.get(keys.selectedVideo);

	onMount(async () => {
		videos = await fetch('/video-list').then(res => res.json());
		selectedVideo = settings.get(keys.selectedVideo);

		if (!selectedVideo && videos.length) {
			selectedVideo = videos[0].src;
		}
	});

	$: settings.set(keys.resume, maintainTime);
	$: settings.set(keys.selectedVideo, selectedVideo)
</script>