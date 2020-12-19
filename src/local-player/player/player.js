import '../../../node_modules/sheodox-ui/style.scss';
import './tampermonkey-shim';
import Player from './AppPlayer.svelte';

const player = new Player({
	target: document.querySelector('#player-root')
});