import { derived, get } from 'svelte/store';
import { aspectRatio, globalFontScale, subtitleClickAction } from '../stores/settings';
import { showBasedSettings, usesShowBasedSettings } from '../stores/by-show-settings';
import { videoController } from '../video-controller';
import { createToast } from '../stores/toasts';

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
	return ['jisho', 'copy', 'context.reviews'].includes(action);
});

export function performSubtitleClickAction(subtitles: string[]) {
	if (subtitles.length === 0) {
		return;
	}

	const subtitleText = subtitles.join('').trim();
	const action = get(subtitleClickAction);

	switch (action) {
		case 'jisho':
			window.open(`https://jisho.org/search/${encodeURIComponent(subtitleText)}`);
			videoController.addPauser('define');
			break;
		case 'copy':
			copyText(subtitleText);
			break;
		case 'context.reviews':
			saveToContextReviews(subtitles);
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

interface XHRResponse {
	status: number;
}

function saveToContextReviews(subtitleText: string[]) {
	GM_xmlhttpRequest({
		url: 'https://context.reviews/phrases/add?jimakuplayer=1',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify({
			phraseText: subtitleText,
		}),
		onload: (res: XHRResponse) => {
			if (res.status === 200) {
				createToast({
					duration: 500,
					variant: 'info',
					message: 'Subtitle saved to Context.Reviews',
				});
			} else {
				createToast({
					duration: 1000,
					variant: 'error',
					message: 'Failed to save to Context.Reviews. Are you logged in?',
				});
			}
		},
	});
}

export const aspectRatioSetting = derived(
	[aspectRatio, usesShowBasedSettings, showBasedSettings],
	([aspectRatio, usesShowBasedSettings, showBasedSettings]) => {
		return usesShowBasedSettings && showBasedSettings.overrideGlobalAspectRatio
			? showBasedSettings.aspectRatio
			: aspectRatio;
	}
);

export function aspectRatioStringToNumber(aspect: string) {
	if (aspect === '4:3') {
		return 4 / 3;
	}
	// 'auto' on SRT just defaults to 16:9.
	// the ASS renderer handles auto itself
	return 16 / 9;
}
