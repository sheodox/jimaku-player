import App from './App.svelte';

const mount = document.createElement('div');
if (location.host.includes('crunchyroll')) {
	//crunchyroll fullscreens the player container, not the entire document,
	//need to put the subtitler in there or it won't be visible when fullscreened
	document.getElementById('vilosRoot').appendChild(mount);
}
else {
	document.body.appendChild(mount);
}
mount.id = 'sheodox-jimaku-player';
mount.style.position = 'fixed';
mount.style.width = '100%';

const app = new App({
	target: mount
});
