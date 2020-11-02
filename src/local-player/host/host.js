import '../../../node_modules/sheodox-ui/style.scss';
import Host from './AppHost.svelte';

const host = new Host({
	target: document.querySelector('#app-root')
});