import { readable, writable, Readable, Unsubscriber } from 'svelte/store';
import { currentTime } from './activity';
import type { Subtitle, SubtitleParser } from '../types/subtitles';

let subs: SubtitleParser;
export const setSubtitles = (subtitleObject: SubtitleParser) => {
	subs = subtitleObject;
};

// The current time through the video, relative to the subtitle file's timings
// (i.e. current video time compensating for alignment)
export const subtitleTime = writable(0);

// Create a readable store for subtitles that should show over the video on the page given the specified offset.
export const createSubtitleTimer = (alignmentOffset: number | Readable<number>) =>
	readable<Subtitle[]>([], (set) => {
		let offset = typeof alignmentOffset === 'number' ? alignmentOffset : 0,
			offsetUnsubscribe: Unsubscriber;

		//allow a store to be passed, for variable times (the main player itself)
		//without having to re-create this subtitleTimer given alignment changes
		if (typeof alignmentOffset !== 'number') {
			offsetUnsubscribe = alignmentOffset.subscribe((alignment) => {
				offset = alignment;
			});
		}

		const unsubCurrentTime = currentTime.subscribe((currentTime) => {
			//currentTime on an HTMLVideoElement is in seconds, convert to ms.
			//Offset is defined in the manual alignment help text as:
			//  The alignment offset is added to the start and end times of every subtitle, so positive numbers will delay
			//  subtitles and negative numbers will show the subtitles earlier.
			//But in practice it's easier to do that in reverse. The logic is still the same, but this is easier
			//than re-computing the start and end times any time the alignment changes.
			const time = currentTime * 1000 - offset;
			// expose the current time of the subtitles being shown
			subtitleTime.set(time);
			set(subs.getSubs(time));
		});

		return () => {
			unsubCurrentTime();
			if (offsetUnsubscribe) {
				offsetUnsubscribe();
			}
		};
	});
