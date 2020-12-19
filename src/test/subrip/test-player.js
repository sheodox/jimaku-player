import '../../local-player/player/tampermonkey-shim';
import VanillaVideo from './VanillaVideo.svelte';
import JPSubRipVideo from './JPSubripVideo.svelte';

const props = {};
location.search.substr(1).split('&').forEach(arg => {
    const [name, value] = arg.split('=');
    props[name] = value;
})

const app = new (props.vanilla ? VanillaVideo: JPSubRipVideo)({
    target: document.getElementById('app-root'),
    props
});