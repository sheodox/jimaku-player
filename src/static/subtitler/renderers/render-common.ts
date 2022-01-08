import { derived, get } from 'svelte/store';
import { globalFontScale, subtitleClickAction } from '../stores/settings';
import { showBasedSettings, usesShowBasedSettings } from '../stores/by-show-settings';
import { videoController } from '../video-controller';

export function joinStyles(stylesArray: string[]) {
	return (
		stylesArray
			//ensure we're not putting `;undefined;` in the styles
			.filter((style) => !!style)
			.join(';')
	);
}

export const fontScale = derived(
	[globalFontScale, usesShowBasedSettings, showBasedSettings],
	([globalFontScale, usesShowBasedSettings, showBasedSettings]) => {
		return usesShowBasedSettings && showBasedSettings.overrideGlobalFontScale
			? showBasedSettings.fontScale
			: globalFontScale;
	}
);

//if we need to do something in response to clicking the subtitles.
export const subtitleActionable = derived(subtitleClickAction, (action) => {
	return ['jisho', 'copy'].includes(action);
});

export function performSubtitleClickAction(subtitleText: string) {
	subtitleText = subtitleText.trim();
	const action = get(subtitleClickAction);

	switch (action) {
		case 'jisho':
			window.open(`https://jisho.org/search/${encodeURIComponent(subtitleText)}`);
			videoController.addPauser('define');
			break;
		case 'copy':
			copyText(subtitleText);
			break;
	}
}

function copyText(subtitleText: string) {
	const copyInput = document.createElement('input');
	document.body.appendChild(copyInput);
	copyInput.value = subtitleText;
	copyInput.select();
	document.execCommand('copy');
	copyInput.remove();
}