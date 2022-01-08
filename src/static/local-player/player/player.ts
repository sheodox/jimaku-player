/// <reference types="vite/client" />
/// <reference types="svelte" />
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { styles } from 'sheodox-ui';
import Player from './AppPlayer.svelte';

new Player({
	target: document.querySelector('#player-root'),
});
