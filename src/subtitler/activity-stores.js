import {writable, readable} from "svelte/store";

/**
 * The current time of the video that's playing.
 * @type {Readable<number>}
 */
export const currentTime = readable(0, set => {
	let frame;

	function onFrame() {
		frame = requestAnimationFrame(onFrame);
		const video = document.querySelector('video');
		if (video) {
			set(video.currentTime);
		}
	}
	onFrame();

	return () => {
		cancelAnimationFrame(frame);
	}
})

/**
 * If the user has performed some keyboard or mouse activity recently.
 * @type {Writable<boolean>}
 */
export const userActive = writable(true),
	ACTIVITY_TIMEOUT = 2000;
let inactiveTimeout
userActive.subscribe(active => {
	if (active) {
		clearTimeout(inactiveTimeout);
		inactiveTimeout = setTimeout(() => {
			userActive.set(false);
		}, ACTIVITY_TIMEOUT);
	}
});
function setActive() {
	userActive.set(true);
}
document.addEventListener('keydown', setActive);
document.addEventListener('mousemove', setActive);
