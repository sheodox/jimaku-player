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
		background: #111218;
		overflow: auto;
		border-radius: 3px;
	}

	.tray:hover > * {
		visibility: visible;
	}

	.tab {
		display: none;
		text-align: left;
		padding: 0.5rem 2rem;
        background: #1c1825;
		border-top: 2px solid #f47521;
	}
	.tab-active {
		display: block;
		flex: 1;
	}
	.tray-tab-buttons {
		margin: 0.2rem;
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
</style>

<div
	class="tray"
	class:inactive={!$userActive}
	on:mouseenter={trayHover(true)}
	on:mouseleave={trayHover(false)}
	style="right: {$trayAnim}rem" class:hidden={fineAdjustDialogVisible}
>
	<h1>字幕プレーヤー</h1>
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
		<div class="tray-tab-buttons">
			<button on:click={() => panel = 'recent'} disabled={panel === 'recent'}>Recent Subtitles</button>
			<button on:click={() => panel = 'setup'} disabled={panel === 'setup'}>Setup</button>
			<button on:click={() => panel = 'settings'} disabled={panel === 'settings'}>Settings</button>
		</div>
		<div class="tab" class:tab-active={panel === 'recent'}>
            <RecentTab {recentSubs} />
		</div>
		<div class="tab" class:tab-active={panel === 'setup'}>
            <SetupTab
				on:realign
				on:restart
				bind:fineAdjustDialogVisible
			/>
		</div>
		<div class="tab tab-settings" class:tab-active={panel === 'settings'}>
            <SettingsTab {subtitles} />
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
		});

	export let recentSubs = [];
	export let subtitles = {};
	export let mode = 'normal';

	let panel = 'recent',
		fineAdjustDialogVisible = false,
		showSettings = false,
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