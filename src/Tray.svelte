<style>
	.tray {
		margin-top: 0.5rem;
		width: 2vw;
		background: rgba(33, 39, 55, 0.2);
		position: fixed;
		right: 0;
		top: 0;
		color: white;
		height: calc(100% - 5rem);
	}

	.tray > * {
		visibility: hidden;
	}

	.tray:hover {
		width: 40vw;
		max-width: 40rem;
		background: rgb(33, 39, 55);
		overflow: auto;
		border-radius: 3px;
	}

	.tray:hover > * {
		visibility: visible;
	}

	.tray h1 {
		font-size: 2rem;
		background: rgb(27, 26, 38);
		padding: 0.5rem 0;
		border-radius: 3px;
		margin: 0 0 0.5rem 0;
		border-bottom: 2px solid #f47521;
	}

	.tray h2 {
		margin: 0;
		text-decoration: underline;
	}
	button {
		margin: 0.5rem;
	}
	.settings {
		background: #1a1d2b;
		margin: 1rem;
		padding: 1rem;
		box-shadow: inset 0 0 0.5rem black;
		border-radius: 3px;
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
	li:not(:first-of-type)::before {
		content: ' ';
		position: relative;
		background: #f47521;
		height: 0.1rem;
		width: 3.2rem;
		display: block;
		margin: 0 auto;
		border-radius: 4px;
	}
</style>

<div class="tray" on:mouseenter={trayHover(true)} on:mouseleave={trayHover(false)}>
	<h1>VRV Subtitler</h1>
	<button on:click={() => showSettings = !showSettings}>{showSettings ? 'Hide' : 'Show'} Settings</button>
	{#if showSettings}
		<div class="settings">
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
	{/if}
	<h2>Recent Subtitles</h2>
	<ul class="recent-subs">
		{#each recentSubs as sub (sub.text)}
			<li in:fly={{y: 50, duration: 200}} out:fly={{y:-50, duration: 200}}>
				<a target="_blank" href={`https://jisho.org/search/${encodeURIComponent(sub.text.trim())}`} rel="noopener noreferrer" on:click={() => dispatch('define-pauser')}>{sub.text}</a>
			</li>
		{/each}
	</ul>
</div>

<script>
	import {createEventDispatcher} from 'svelte';
	import {fly} from 'svelte/transition';
	const dispatch = createEventDispatcher();

	export let recentSubs = [];
	let showSettings = false,
		showSubs = true,
		pauseOnTray = true;

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