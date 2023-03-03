/// <reference types="vite/client" />
/// <reference types="svelte" />
import Player from './AppPlayer.svelte';

new Player({
	target: document.querySelector('#player-root'),
});
