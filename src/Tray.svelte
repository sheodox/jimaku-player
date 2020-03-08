<style>
	.tray {
		margin-top: 0.5rem;
		width: 2vw;
		background: rgba(255, 255, 255, 0.2);
		position: fixed;
		right: 0;
		top: 0;
		color: white;
		height: calc(100% - 5rem);
		display: flex;
		flex-direction: column;
	}

	.tray > * {
		visibility: hidden;
	}

	.tray:hover {
		width: 40vw;
		max-width: 40rem;
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
	}
	a {
		color: white;
		transform: scaleY(0);
		transform-origin: top;
		transition: transform 0.5s ease;
		font-size: 1rem;
        text-decoration: none;
	}
	a:hover {
		color: #0aff8c;
		cursor: pointer;
		text-decoration: underline;
	}
	li {
		padding-bottom: 0.2rem;
	}
	li:not(:first-of-type)::before {
		content: ' ';
		position: relative;
		border: 1px solid #7b724e;
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
	}
	.tab-active {
		display: block;
		flex: 1;
	}
	.tray-tab-buttons {
		margin: 0.2rem;
		border-bottom: 2px solid #f47521;
	}
</style>

<div class="tray" on:mouseenter={trayHover(true)} on:mouseleave={trayHover(false)}>
	<h1>VRV Subtitler</h1>
	<div>

	</div>
	<div class="tray-tab-buttons">
		<button on:click={() => panel = 'recent'} disabled={panel === 'recent'}>Recent Subtitles</button>
		<button on:click={() => panel = 'settings'} disabled={panel === 'settings'}>Settings</button>
		<button on:click={() => panel = 'debug'} disabled={panel === 'debug'}>Debug</button>
	</div>
	<div class="tab" class:tab-active={panel === 'recent'}>
		<h2>Recent Subtitles</h2>
		<ul class="recent-subs">
			{#each recentSubs as sub (sub.text)}
				<li in:fly={{y: 50, duration: 200}} out:fly={{y:-50, duration: 200}}>
					<a target="_blank" href={`https://jisho.org/search/${encodeURIComponent(sub.text.trim())}`} rel="noopener noreferrer" on:click={() => dispatch('define-pauser')}>{sub.text}</a>
				</li>
			{/each}
		</ul>
	</div>
	<div class="tab" class:tab-active={panel === 'settings'}>
		<h2>Settings</h2>
		<button on:click={() => dispatch('restart')}>
			Reselect subtitles
		</button>
		<button on:click={() => dispatch('realign')}>
			Realign subtitles
		</button>
		<br>
		<input id="show-subs" type="checkbox" checked on:change={toggleSetting('show-subs')}>
		<label for="show-subs">Show subs over video</label>
		<br>
		<input id="pause-on-tray" type="checkbox" bind:checked={pauseOnTray}>
		<label for="pause-on-tray">Pause when tray is open</label>
	</div>
	<div class="tab" class:tab-active={panel === 'debug'}>
		<h2>Debug Information</h2>
		<dl>
			<dt>Subtitles File</dt>
			<dd>{subtitles.fileName}</dd>

			<dt>Alignment</dt>
			<dd>{alignment > 0 ? '+' : ''}{(alignment / 1000).toFixed(1)} seconds</dd>

			{#each subtitles.debugInfo() as info}
				<dt>{info.title}</dt>
				<dd>{info.detail}</dd>
			{/each}
		</dl>
		<a href={createParsedSubDownloadLink()} download="parsed-subtitles.json">⬇ Download Parsed Subtitles</a>
	</div>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	import {fly, fade} from 'svelte/transition';
	const dispatch = createEventDispatcher();

	export let recentSubs = [];
	export let subtitles = {};
	export let alignment = 0;
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
			// only check if we need to add a pauser, controlled by the option, if the tray is being entered, don't
			// want that to control if we remove a pauser, that's not the point
			if (!isEntering || pauseOnTray) {
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