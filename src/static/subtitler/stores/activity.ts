import { writable, readable } from 'svelte/store';
function getVideo() {
	return document.querySelector('video');
}

/**
 * The current time of the video that's playing.
 */
export const currentTime = readable<number>(0, (set) => {
	let frame: number;

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
	};
});

/**
 * If the user has performed some keyboard or mouse activity recently.
 */
export const userActive = writable(true),
	//a roughly similar time to how long it takes vrv to hide its controls after the user stops interacting
	ACTIVITY_TIMEOUT = 2500;

let inactiveTimeout: ReturnType<typeof setTimeout>;
function setActive() {
	userActive.set(true);

	// schedule setting the user to inactive. if they're still active this will continue to get delayed
	clearTimeout(inactiveTimeout);
	inactiveTimeout = setTimeout(() => {
		userActive.set(false);
	}, ACTIVITY_TIMEOUT);
}
document.addEventListener('keydown', setActive);
document.addEventListener('mousemove', setActive);
