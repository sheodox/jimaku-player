import {writable, get, derived} from "svelte/store";
import {showNameStore} from "./alignmentStore";

function getDefaultSettings() {
    return {
        overrideGlobalFontScale: false,
        fontScale: 1
    };
}

function getShowSettingsKey(showName) {
    return `show-based-settings-${showName}`;
}

export const usesShowBasedSettings = derived(showNameStore, showName => !!showName);
export const showBasedSettings = writable({});

let pauseSavingSettings = false;
showBasedSettings.subscribe(settings => {
    //when we're loading settings we don't want to save, we just loaded them!
    //we only want to save them when we actually have a change to save
    if (!pauseSavingSettings) {
        const showName = get(showNameStore);
        GM_setValue(getShowSettingsKey(showName), settings);
    }
})

showNameStore.subscribe(showName => {
    const defaults = getDefaultSettings();
    pauseSavingSettings = true;

    showBasedSettings.set({
        ...defaults,
        ...(GM_getValue(getShowSettingsKey(showName), {}))
    });

    pauseSavingSettings = false;
});
