import {readable, writable} from "svelte/store";
import {currentTime} from "./activity-stores";

let subs;
export const setSubtitles = subtitleObject => {
	subs = subtitleObject;
}

export const subtitleTime = writable(0);

/**
 * Create a readable store for subtitles that should show over the video on the page given the specified offset.
 * @param offsetOrStore - an alignment number (offset in ms) or
 * @returns {readable<*[]>}
 */
export const createSubtitleTimer = offsetOrStore => readable([], set => {
	let offset = typeof offsetOrStore === 'number' ? offsetOrStore : 0,
		offsetUnsubscribe;

	//allow a store to be passed, for variable times (the main player itself)
	//without having to re-create this subtitleTimer given alignment changes
	if (typeof offsetOrStore !== 'number') {
		offsetUnsubscribe = offsetOrStore.subscribe(alignment => {
			offset = alignment;
		})
	}

	const unsubCurrentTime = currentTime.subscribe(currentTime => {
		const time = currentTime * 1000 - offset
		subtitleTime.set(time);
		set(subs.getSubs(time))
	})

	return () => {
		unsubCurrentTime();
		if (offsetUnsubscribe) {
			offsetUnsubscribe();
		}
	}
})

