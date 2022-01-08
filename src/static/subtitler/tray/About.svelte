<style>
	table {
		border: 1px solid var(--shdx-gray-300);
		border-radius: 3px;
	}
	.modal-body {
		width: 30rem;
		text-align: left;
	}
</style>

<div class="modal-body pt-0">
	<div class="mb-3">
		<TabList bind:selectedTab {tabs} />
	</div>
	<Tab tabId="about" {selectedTab}>
		<p>
			Jimaku Player is made by <ExternalLink href="https://github.com/sheodox">sheodox</ExternalLink>, a Software
			Engineer from Minnesota.
		</p>
		<div class="mt-4">
			<ExternalLink href="https://github.com/sheodox/jimaku-player">Project homepage (Github)</ExternalLink>
			<br />
			<ExternalLink href="https://github.com/sheodox/jimaku-player/issues"
				>Report a bug or request a feature</ExternalLink
			>
			<br />
			<ExternalLink href="https://www.buymeacoffee.com/sheodox">Buy Me a Coffee</ExternalLink>
		</div>
		<p>
			I also made <ExternalLink href="https://context.reviews">Context.Reviews</ExternalLink> which helps make Anki cards
			from phrases you've looked up on Jisho!
		</p>
	</Tab>
	<Tab tabId="debug" {selectedTab}>
		<table>
			<tbody>
				<tr>
					<th scope="row">Subtitles File</th>
					<td>{subtitleParser.fileName}</td>
				</tr>

				<tr>
					<th scope="row">Alignment</th>
					<td>{$explainedSecondsStore} ({$signedSecondsStore})</td>
				</tr>

				{#each subtitleParser.debugInfo() as info}
					<tr>
						<th scope="row">{info.title}</th>
						<td>{info.detail}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<button on:click={() => downloadParsedSubtitles()}>⬇ Download parsed subtitles</button>
		<button on:click={() => downloadParsedSubtitles($subtitleTime)}
			>⬇ Download currently visible parsed subtitles</button
		>
	</Tab>
</div>

<script lang="ts">
	import { TabList, Tab } from 'sheodox-ui';
	import ExternalLink from '../../local-player/ExternalLink.svelte';
	import { explainedSecondsStore, signedSecondsStore } from '../stores/alignment';
	import { subtitleTime } from '../stores/subtitle-timer';
	import type { SubtitleParser } from '../types/subtitles';

	export let subtitleParser: SubtitleParser;

	const tabs = [
		{
			id: 'about',
			title: 'About',
		},
		{
			id: 'debug',
			title: 'Debug',
		},
	];
	let selectedTab: string;

	function downloadParsedSubtitles(atTime?: number) {
		const a = document.createElement('a'),
			downloadBlob = new Blob([subtitleParser.serialize(atTime)], { type: 'application/json' });
		a.download = 'parsed-subtitles.json';
		a.href = URL.createObjectURL(downloadBlob);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>
