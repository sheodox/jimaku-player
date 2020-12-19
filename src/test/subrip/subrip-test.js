import '../../../node_modules/sheodox-ui/style.scss';
import '../../local-player/player/tampermonkey-shim';
import TestSubripApp from './TestSubripApp.svelte';

const app = new TestSubripApp({
    target: document.querySelector('#app-root')
});
