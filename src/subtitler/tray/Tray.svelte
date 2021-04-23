<style>
	.tray {
		width: 28rem;
		margin-top: 0.5rem;
		background: rgba(255, 255, 255, 0.2);
		position: fixed;
		right: 0;
		top: 0;
		color: white;
		height: calc(100% - 10rem);
		display: flex;
		flex-direction: column;
        text-align: center;
		border-radius: 5px 0 0 5px;
	}

	.tray.inactive {
		background: transparent;
		transition: background 0.2s;
	}

	.tray > * {
		visibility: hidden;
	}

	.tray:hover {
		background: #0c1015;
		overflow: auto;
		border-radius: 3px;
		border: 1px solid #8c8c8c21;
		border-right: none;
	}

	.tray:hover > :global(*) {
		visibility: visible;
	}

	.tray-header {
		background: #181d2b;
		border-bottom: 1px solid #8c8c8c21;
	}

	.tab-content {
		text-align: left;
		padding: 0.5rem 2rem;
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
</style>

<div
	class="tray"
	class:inactive={!$userActive}
	on:mouseenter={trayHover(true)}
	on:mouseleave={trayHover(false)}
	style="right: {$trayAnim}rem" class:hidden={fineAdjustDialogVisible}
>
	<div class="tray-header">
		<h1>字幕プレーヤー</h1>
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
				<a target="_blank" href="https://github.com/sheodox/jimaku-player/issues" rel="noopener noreferrer">Issue? Report it here!</a>
			</div>
		</div>
	{:else if mode === 'normal'}
		<div class="tab-content">
			<Tab tabId="recent" bind:selectedTab>
				<RecentTab {recentSubs} />
			</Tab>
			<Tab tabId="setup" bind:selectedTab>
				<SetupTab
					on:realign
					on:restart
					bind:fineAdjustDialogVisible
				/>
			</Tab>
			<Tab tabId="settings" bind:selectedTab>
				<SettingsTab {subtitles} />
			</Tab>
		</div>
	{/if}
	<div class="row">
		<a target="_blank" href="https://discord.gg/Vyjjyj4" rel="noopener noreferrer">Join the Discord community for release notes and discussion!</a>
	</div>
</div>
{#if fineAdjustDialogVisible}
	<FineAdjust on:close={() => fineAdjustDialogVisible = false} />
{/if}

<script>
	import {createEventDispatcher} from 'svelte';
	import {Tab, TabList} from 'sheodox-ui';
	import {get} from 'svelte/store';
	import {
		pauseWhenTrayOpen,
	} from '../settingsStore';
	import {tweened} from 'svelte/motion';
	import {cubicOut} from 'svelte/easing';
	import FineAdjust from "../FineAdjust.svelte";
	import {userActive} from "../activity-stores";
	import RecentTab from "./RecentTab.svelte";
	import SetupTab from "./SetupTab.svelte";
	import SettingsTab from "./SettingsTab.svelte";

	const dispatch = createEventDispatcher(),
		trayStates = {
			hidden: -26,
			shown: 0
		},
		trayAnim = tweened(trayStates.hidden, {
			duration: 300,
			easing: cubicOut
		}),
		tabList = [{
			id: 'recent',
			title: 'Recent Subtitles'
		}, {
			id: 'setup',
			title: 'Setup'
		}, {
			id: 'settings',
			title: 'Settings'
		}];

	export let recentSubs = [];
	export let subtitles = {};
	export let mode = 'normal';

	let panel = 'recent',
		fineAdjustDialogVisible = false,
		showSettings = false,
		selectedTab,
		showSubs = true;

	function trayHover(isEntering) {
		return () => {
			trayAnim.set(isEntering ? trayStates.shown : trayStates.hidden);
			// only check if we need to add a pauser, controlled by the option, if the tray is being entered, don't
			// want that to control if we remove a pauser, that's not the point
			if (!isEntering || get(pauseWhenTrayOpen)) {
				dispatch('tray-pauser', isEntering);
			}
		}
	}

	function toggleSetting(setting) {
		return e => {
			dispatch(setting, e.target.checked);
		}
	}
</script>