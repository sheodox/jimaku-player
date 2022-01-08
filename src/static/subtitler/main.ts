import App from './App.svelte';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { styles } from 'sheodox-ui';
import './style/style.scss';

const mount = document.createElement('div');
if (location.host.includes('crunchyroll')) {
	//crunchyroll fullscreens the player container, not the entire document,
	//need to put the subtitler in there or it won't be visible when fullscreened
	document.getElementById('vilosRoot').appendChild(mount);
} else {
	document.body.appendChild(mount);
}
mount.id = 'sheodox-jimaku-player';
mount.style.position = 'fixed';
mount.style.width = '100%';
// crunchyroll's player might have some overlays that catch all clicks,
// make any of jimaku player's buttons unclickable
mount.style.zIndex = '999999999';

new App({
	target: mount,
});
