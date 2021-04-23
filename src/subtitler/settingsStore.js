import {writable} from 'svelte/store';

const settingsKey = 'settings-store',
	defaultSettings = {
		subtitleFallbackColor: '#FFFFFF',
		showSubtitlesOnVideo: true,
		pauseWhenTrayOpen: true,
		invertVerticalAlignment: true,
		autoCopySubtitles: false,
		globalFontScale: 1,
		subtitleClickAction: 'jisho'
	},
	//stores are interacted with, which updates 'state' which will get persisted with GM_setValue
	state = Object.assign({}, defaultSettings, GM_getValue(settingsKey, {})),
	stores = {};

Object.keys(defaultSettings).forEach(settingName => {
	const store = stores[settingName] = writable(state[settingName]);

	//when bound values are changed, persist the whole settings state
	store.subscribe(value => {
		state[settingName] = value;
		GM_setValue(settingsKey, state);
	});
});

export const subtitleFallbackColor = stores.subtitleFallbackColor;
export const showSubtitlesOnVideo = stores.showSubtitlesOnVideo;
export const pauseWhenTrayOpen = stores.pauseWhenTrayOpen;
export const invertVerticalAlignment = stores.invertVerticalAlignment;
export const autoCopySubtitles = stores.autoCopySubtitles;
export const globalFontScale = stores.globalFontScale;
export const subtitleClickAction = stores.subtitleClickAction;

