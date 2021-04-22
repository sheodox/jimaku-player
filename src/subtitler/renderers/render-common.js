import {derived, get} from 'svelte/store';
import {globalFontScale, subtitleClickAction} from "../settingsStore";
import {showBasedSettings, usesShowBasedSettings} from "../by-show-settings";
import {videoController} from "../VideoController";

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

//if the desired subtitle action is something that's obvious to the user.
//while 'do nothing' actually does run some code we want to pretend it doesn't
//to make it look like you just clicked the
export const subtitleActionable = derived(subtitleClickAction, action => {
	return ['jisho', 'copy'].includes(action);
})

export function performSubtitleClickAction(subtitleText) {
	subtitleText = subtitleText.trim();
	const action = get(subtitleClickAction);

	switch (action) {
		case 'jisho':
			window.open(`https://jisho.org/search/${encodeURIComponent(subtitleText)}`)
			videoController.addPauser('define');
			break;
		case 'copy':
			const copyInput = document.createElement('input');
			document.body.appendChild(copyInput);
			copyInput.value = subtitleText;
			copyInput.select();
			document.execCommand('copy');
			copyInput.remove();
			break;
		default:
			//pretend like the user clicked through the subtitle and toggle pause. the event
			//can't just be bubbled up as the video player won't catch that event because of
			//where jimaku-player is mounted in the DOM.
			const video = document.querySelector('video');
			video.paused ? video.play() : video.pause();
	}
}