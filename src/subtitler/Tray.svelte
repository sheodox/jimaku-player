<style>
	.tray {
		width: 28rem;
		margin-top: 0.5rem;
		background: rgba(255, 255, 255, 0.2);
		position: fixed;
		right: 0;
		top: 0;
		color: white;
		height: calc(100% - 5rem);
		display: flex;
		flex-direction: column;
        text-align: center;
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

	.tray h1 {
		font-size: 2rem;
		padding: 0.5rem 0;
		border-radius: 3px;
		margin: 0;
	}

	.tray h2 {
		text-decoration: underline;
		margin: 0 0 0.4rem;
	}
	ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column-reverse;
	}
	a {
		color: white;
		transform: scaleY(0);
		transform-origin: top;
		transition: transform 0.5s ease;
		font-family: "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
	}
	.tab-recent a:not(:hover) {
		text-decoration: none;
	}
	a:hover {
		color: #0aff8c;
		cursor: pointer;
		text-decoration: underline;
	}
	li {
		padding-bottom: 0.2rem;
		white-space: pre;
	}
	li:not(:first-of-type)::after {
		content: ' ';
		height: 0;
		position: relative;
		border: 1px solid #4a4a6a;
		display: block;
		margin: 0 auto;
		border-radius: 4px;
	}
	dt {
		font-weight: bold;
	}
    dd {
		font-style: italic;
	}

	.tab {
		display: none;
		text-align: left;
		padding: 2rem;
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
</style>

<div class="tray" on:mouseenter={trayHover(true)} on:mouseleave={trayHover(false)} style="right: {$trayAnim}rem">
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
			<button on:click={() => panel = 'settings'} disabled={panel === 'settings'}>Settings</button>
			<button on:click={() => panel = 'debug'} disabled={panel === 'debug'}>Debug</button>
		</div>
		<div class="tab tab-recent" class:tab-active={panel === 'recent'}>
			<h2>Recent Subtitles</h2>
			<ul class="recent-subs">
				{#each recentSubs as sub, i (sub.text)}
					<li in:fly={{y: -50, duration: 200}} out:fly={{y:50, duration: 200}} animate:flip={{duration: 200}} style={recentSubSize(i)}>
						<a target="_blank" href={`https://jisho.org/search/${encodeURIComponent(sub.text.trim())}`} rel="noopener noreferrer" on:click={() => dispatch('define-pauser')}>{sub.text}</a>
					</li>
				{/each}
			</ul>
		</div>
		<div class="tab tab-settings" class:tab-active={panel === 'settings'}>
			<h2>Settings</h2>
            <div class="row">
				<button on:click={() => dispatch('restart')} class="secondary">
					Reselect subtitles
				</button>
				<button on:click={() => dispatch('realign')} class="secondary">
					Realign subtitles
				</button>
			</div>
			<div class="row">
				<label for="subtitle-color">Subtitle fallback color:</label>
				<input type="color" id="subtitle-color" bind:value={$subtitleFallbackColor}>
			</div>
			<div class="row">
				<input id="show-subs" type="checkbox" bind:checked={$showSubtitlesOnVideo}>
				<label for="show-subs">Show subs over video</label>
			</div>
            <div class="row">
				<input id="pause-on-tray" type="checkbox" bind:checked={$pauseWhenTrayOpen}>
				<label for="pause-on-tray">Pause when tray is open</label>
			</div>
			<div class="row">
				<input id="invert-subtitle-alignment" type="checkbox" bind:checked={$invertVerticalAlignment}>
				<label for="invert-subtitle-alignment">
					Invert subtitle vertical alignment (i.e. if subtitles should be near the bottom this will make them show near the top).
					You'll likely want this enabled if you intend to watch with VRV's subtitles at the same time.
				</label>
			</div>
		</div>
		<div class="tab tab-debug" class:tab-active={panel === 'debug'}>
			<h2>Debug Information</h2>
			<dl>
				<dt>Subtitles File</dt>
				<dd>{subtitles.fileName}</dd>

				<dt>Alignment</dt>
				<dd>{alignment > 0 ? '+' : ''}{(alignment / 1000).toFixed(2)} seconds</dd>

				{#each subtitles.debugInfo() as info}
					<dt>{info.title}</dt>
					<dd>{info.detail}</dd>
				{/each}
			</dl>
			<div class="row">
				<a href={createParsedSubDownloadLink()} download="parsed-subtitles.json">⬇ Download Parsed Subtitles</a>
			</div>
			<div class="row">
				<a target="_blank" href="https://github.com/sheodox/jimaku-player/issues" rel="noopener noreferrer">Issue? Report it here!</a>
			</div>
		</div>
	{/if}
	<div class="row">
		<a target="_blank" href="https://discord.gg/2Mz6BR" rel="noopener noreferrer">Join our Discord for release news and discussion</a>
	</div>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	import {get} from 'svelte/store';
	import {
		subtitleFallbackColor,
		showSubtitlesOnVideo,
		pauseWhenTrayOpen,
		invertVerticalAlignment
	} from './settingsStore';
	import {fly, fade} from 'svelte/transition';
	import {flip} from 'svelte/animate';
	import {tweened} from 'svelte/motion';
	import {cubicOut} from 'svelte/easing';
	const dispatch = createEventDispatcher(),
		trayStates = {
			hidden: -26,
			shown: 0
		},
		trayAnim = tweened(trayStates.hidden,  {
			duration: 300,
			easing: cubicOut
		});

	export let recentSubs = [];
	export let subtitles = {};
	export let alignment = 0;
	export let mode = 'normal';

	function recentSubSize(index) {
		return `font-size: ${(0.5 + 0.5 * ((index + 1) / recentSubs.length)) * 20}px`;
	}

	let panel = 'recent',
		showSettings = false,
		showSubs = true,
		pauseOnTray = true;

	function createParsedSubDownloadLink() {
		const downloadBlob = new Blob([subtitles.serialize()], {type: 'application/json'});
		return URL.createObjectURL(downloadBlob);
	}

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