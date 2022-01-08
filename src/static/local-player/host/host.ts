/// <reference types="vite/client" />
/// <reference types="svelte" />
import Host from './AppHost.svelte';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { styles } from 'sheodox-ui';

new Host({
	target: document.querySelector('#app-root'),
});
