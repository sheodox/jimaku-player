/// <reference types="vite/client" />
/// <reference types="svelte" />
import Host from './AppHost.svelte';

new Host({
	target: document.querySelector('#app-root'),
});
