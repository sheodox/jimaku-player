import { writable, get, derived } from 'svelte/store';
import { showNameStore } from './alignment';

interface ShowBasedSettings {
	overrideGlobalFontScale: boolean;
	fontScale: number;
}

function getDefaultSettings(): ShowBasedSettings {
	return {
		overrideGlobalFontScale: false,
		fontScale: 1,
	};
}

function getShowSettingsKey(showName: string) {
	return `show-based-settings-${showName}`;
}

export const usesShowBasedSettings = derived(showNameStore, (showName) => !!showName);
export const showBasedSettings = writable<ShowBasedSettings>(getDefaultSettings());

let pauseSavingSettings = false;
showBasedSettings.subscribe((settings) => {
	//when we're loading settings we don't want to save, we just loaded them!
	//we only want to save them when we actually have a change to save
	if (!pauseSavingSettings) {
		const showName = get(showNameStore);
		GM_setValue(getShowSettingsKey(showName), settings);
	}
});

showNameStore.subscribe((showName) => {
	const defaults = getDefaultSettings();
	pauseSavingSettings = true;

	showBasedSettings.set({
		...defaults,
		...GM_getValue(getShowSettingsKey(showName), {}),
	});

	pauseSavingSettings = false;
});
