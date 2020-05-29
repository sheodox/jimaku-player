import {readable} from "svelte/store";

let subs;
export const setSubtitles = subtitleObject => {
	subs = subtitleObject;
}

/**
 * Create a readable store for subtitles that should show over the video on the page given the specified offset.
 * @param offsetOrStore - an alignment number (offset in ms) or
 * @returns {readable<*[]>}
 */
export const createSubtitleTimer = offsetOrStore => readable([], set => {
	let offset = typeof offsetOrStore === 'number' ? offsetOrStore : 0,
		af, offsetUnsubscribe;

	//allow a store to be passed, for variable times (the main player itself)
	//without having to re-create this subtitleTimer given alignment changes
	if (typeof offsetOrStore !== 'number') {
		offsetUnsubscribe = offsetOrStore.subscribe(alignment => {
			offset = alignment;
		})
	}
	const video = document.querySelector('video'),
		update = () => {
			set(subs.getSubs(video.currentTime * 1000 - offset))
			af = requestAnimationFrame(update);
		};

	update();
	return () => {
		cancelAnimationFrame(af);
		if (offsetUnsubscribe) {
			offsetUnsubscribe();
		}
	}
})

