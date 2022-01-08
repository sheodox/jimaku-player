// these are polyfills for APIs tampermonkey provides for use in the dev server
// their type declarations are in src/static/subtitler/types.d.ts
// and they are requested in the /dist.js build script

window.GM_setValue = (key, value) => {
	return localStorage.setItem(key, JSON.stringify(value));
};
window.GM_getValue = (key, fallback = null) => {
	const val = localStorage.getItem(key);
	return val ? JSON.parse(val) : fallback;
};

let setClipboardWarned = false;
// no-op to prevent errors, cannot match the unprompted copies of GM_setClipboard
window.GM_setClipboard = () => {
	if (!setClipboardWarned) {
		setClipboardWarned = true;
		console.warn(`GM_setClipboard usage was attempted, this is not polyfilled by the local Jimaku Player!`);
	}
};
export {};
