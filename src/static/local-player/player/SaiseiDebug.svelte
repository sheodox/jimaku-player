<style>
	.modal-body {
		padding: 0 1rem 1rem 1rem;
	}
	h2 {
		font-size: 1.1rem;
		margin: 0;
	}
	button {
		font-size: 0.8rem;
	}
</style>

<div class="modal-body">
	<h2>Download MPD files</h2>

	<button on:click={() => downloadMpd(metadata.title, metadata.video.mpd)}>
		<Icon icon="file-video" />
		Video
	</button>
	{#each metadata.audio as audio}
		<button on:click={() => downloadMpd(getTrackTitle(audio), audio.mpd)}>
			<Icon icon="file-audio" />
			{getTrackTitle(audio)}
		</button>
	{/each}

	<h2>Download stream probes</h2>
	<button
		on:click={() =>
			downloadFile(`${metadata.title}-video.json`, 'application/json', JSON.stringify(metadata.video.probe, null, 4))}
	>
		<Icon icon="file-video" />
		Video
	</button>
	{#each metadata.audio as audio}
		<button
			on:click={() =>
				downloadFile(
					`${metadata.title}-audio-${getTrackTitle(audio)}.json`,
					'application/json',
					JSON.stringify(audio.probe, null, 4)
				)}
		>
			<Icon icon="file-audio" />
			{getTrackTitle(audio)}
		</button>
	{/each}

	{#if metadata.subtitles.length}
		<h2>Download subtitle files</h2>

		{#each metadata.subtitles as subs}
			<button on:click={() => downloadFile(`${getTrackTitle(subs)}.${subs.format}`, 'text/plain', subs.content)}>
				<Icon icon="closed-captioning" />
				{getTrackTitle(subs)} [{subs.format.toUpperCase()}]
			</button>
		{/each}
	{/if}
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { getTrackTitle, downloadFile } from '../utils';
	import type { ManifestFile } from '../../../shared/types/videos';

	export let metadata: ManifestFile;

	function downloadMpd(title: string, mpdText: string) {
		downloadFile(`${title}.mpd`, 'text/xml', mpdText);
	}
</script>
