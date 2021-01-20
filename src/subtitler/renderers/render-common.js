import {derived} from 'svelte/store';
import {globalFontScale} from "../settingsStore";
import {showBasedSettings, usesShowBasedSettings} from "../by-show-settings";

export function joinStyles(stylesArray) {
	return stylesArray
		//ensure we're not putting `;undefined;` in the styles
		.filter(style => !!style)
		.join(';');
}

export const fontScale = derived(
	[globalFontScale, usesShowBasedSettings, showBasedSettings],
	([globalFontScale, usesShowBasedSettings, showBasedSettings]) => {
		return usesShowBasedSettings && showBasedSettings.overrideGlobalFontScale
			? showBasedSettings.fontScale
			: globalFontScale;
	}
)