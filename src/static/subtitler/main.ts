import App from './App.svelte';
import './style/style.scss';

const mount = document.createElement('div');

function findContainer() {
	if (location.host.includes('crunchyroll')) {
		//crunchyroll fullscreens the player container, not the entire document,
		//need to put the subtitler in there or it won't be visible when fullscreened
		return document.getElementById('vilosRoot');
	} else {
		return document.body;
	}
}

function init() {
	const container = findContainer();

	if (!container) {
		// try again and hope the body has loaded, this can happen with extensions like Crunchyroll With Better Seasons
		// which interrupt the page loading so the player container might not be there immediately
		return setTimeout(() => {
			init();
		}, 10);
	}
	container.appendChild(mount);

	mount.id = 'sheodox-jimaku-player';
	mount.style.position = 'fixed';
	mount.style.width = '100%';
	mount.style.pointerEvents = 'none';
	// crunchyroll's player might have some overlays that catch all clicks,
	// make any of jimaku player's buttons unclickable
	mount.style.zIndex = '999999999';

	new App({
		target: mount,
	});
}

init();
