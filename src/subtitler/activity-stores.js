import {writable, readable} from "svelte/store";
function getVideo() {
	return document.querySelector('video');
}

/**
 * The current time of the video that's playing.
 * @type {Readable<number>}
 */
export const currentTime = readable(0, set => {
	let frame;

	function onFrame() {
		frame = requestAnimationFrame(onFrame);
		const video = getVideo();
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
	//a roughly similar time to how long it takes vrv to hide its controls after the user stops interacting
	ACTIVITY_TIMEOUT = 2500;
let inactiveTimeout;
function setActive() {
	userActive.set(true);

	clearTimeout(inactiveTimeout);
	inactiveTimeout = setTimeout(() => {
		userActive.set(false);
	}, ACTIVITY_TIMEOUT);
}
document.addEventListener('keydown', setActive);
document.addEventListener('mousemove', setActive);
