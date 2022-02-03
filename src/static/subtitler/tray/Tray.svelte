<style>
	.tray {
		width: 28rem;
		background: rgba(255, 255, 255, 0.2);
		position: fixed;
		right: 0;
		top: 50%;
		color: white;
		height: calc(100% - 15rem);
		display: flex;
		flex-direction: column;
		text-align: center;
		border-radius: 5px 0 0 5px;
		transform: translateY(-50%);
	}

	.tray.inactive {
		background: transparent;
		transition: background 0.2s;
	}

	.tray > * {
		visibility: hidden;
	}

	.tray:hover {
		background: var(--shdx-gray-700);
		overflow: auto;
		border-radius: 3px;
		border: 1px solid #8c8c8c21;
		border-right: none;
	}

	.tray:hover > :global(*) {
		visibility: visible;
	}

	.tray-header {
		background: var(--shdx-gray-600);
	}

	.tab-content {
		text-align: left;
		flex: 1;
	}
	.row:not(:last-child) {
		margin-bottom: 0.5rem;
	}
	.tab-cancelled {
		text-align: center;
	}
	.hidden {
		display: none;
	}
	.tray :global(.tab-list) {
		margin: 0;
	}
	.tray :global(.tab-list li) {
		display: inline-block;
	}
	#app-title {
		line-height: 1;
		font-size: 1.2rem;
	}
</style>

<div
	class="tray"
	class:inactive={!$userActive}
	on:mouseenter={trayHover(true)}
	on:mouseleave={trayHover(false)}
	style="right: {$trayAnim}rem"
	class:hidden={fineAdjustDialogVisible}
>
	<div class="tray-header">
		<div class="f-row justify-content-between align-items-center px-3 py-2">
			<h1 class="f-row align-items-end justify-content-center">
				<Logo />
				<div id="app-title" class="ml-2">字幕プレーヤー</div>
			</h1>
			<button on:click={() => (showAbout = true)}>About</button>
		</div>
		{#if mode === 'normal'}
			<div class="tray-tab-buttons">
				<TabList tabs={tabList} bind:selectedTab />
			</div>
		{/if}
	</div>
	{#if mode === 'cancelled'}
		<div class="tab tab-active tab-cancelled">
			<div class="row">
				<button on:click={() => dispatch('restart')}>Select Subtitles</button>
			</div>
			<div class="row">
				<ExternalLink href="https://github.com/sheodox/jimaku-player/issues">Issue? Report it here!</ExternalLink>
			</div>
		</div>
	{:else if mode === 'normal'}
		<div class="tab-content px-4">
			<Tab tabId="recent" {selectedTab}>
				<RecentTab {recentSubs} />
			</Tab>
			<Tab tabId="setup" {selectedTab}>
				<SetupTab on:realign on:restart bind:fineAdjustDialogVisible />
			</Tab>
			<Tab tabId="settings" {selectedTab}>
				<SettingsTab />
			</Tab>
		</div>
	{/if}
	<div class="p-2 has-inline-links">
		<ExternalLink href="https://discord.gg/Vyjjyj4">Join the Discord community!</ExternalLink>
	</div>
</div>

{#if fineAdjustDialogVisible}
	<FineAdjust on:close={() => (fineAdjustDialogVisible = false)} />
{/if}

{#if showAbout}
	<Modal bind:visible={showAbout} title="About 字幕プレーヤー">
		<About {subtitleParser} />
	</Modal>
{/if}

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Tab, Modal, TabList } from 'sheodox-ui';
	import { get } from 'svelte/store';
	import { pauseWhenTrayOpen } from '../stores/settings';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import FineAdjust from '../FineAdjust.svelte';
	import { userActive } from '../stores/activity';
	import RecentTab from './RecentTab.svelte';
	import SetupTab from './SetupTab.svelte';
	import SettingsTab from './SettingsTab.svelte';
	import Logo from '../Logo.svelte';
	import About from './About.svelte';
	import ExternalLink from '../../local-player/ExternalLink.svelte';
	import type { Subtitle, SubtitleParser } from '../types/subtitles';

	const dispatch = createEventDispatcher<{
			restart: void;
			'tray-pauser': boolean;
		}>(),
		trayStates = {
			hidden: -26,
			shown: 0,
		},
		trayAnim = tweened(trayStates.hidden, {
			duration: 300,
			easing: cubicOut,
		}),
		tabList = [
			{
				id: 'recent',
				title: 'Recent Subtitles',
			},
			{
				id: 'setup',
				title: 'Setup',
			},
			{
				id: 'settings',
				title: 'Settings',
			},
		];

	export let recentSubs: Subtitle[] = [];
	export let subtitleParser: SubtitleParser = null;
	export let mode = 'normal';

	let showAbout = false,
		fineAdjustDialogVisible = false,
		selectedTab: string;

	function trayHover(isEntering: boolean) {
		return () => {
			trayAnim.set(isEntering ? trayStates.shown : trayStates.hidden);
			// only check if we need to add a pauser, controlled by the option, if the tray is being entered, don't
			// want that to control if we remove a pauser, that's not the point
			if (!isEntering || get(pauseWhenTrayOpen)) {
				dispatch('tray-pauser', isEntering);
			}
		};
	}
</script>
