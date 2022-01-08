import { MINIMUM_BUFFER_INTERVAL } from './player/MPDParser';
import type { ManifestAudioTrack, ManifestSubtitleTrack } from '../../shared/types/videos';

/**
 * Change a number in seconds to mm:ss or hh:mm:ss
 * @param seconds - number of seconds, not ms because video elements deal in seconds
 * @param forcePadHours - if we should pad 00 for hours regardless of if the time is over an hour,
 * if the duration of the video is over an hour the width of the times displayed will change once
 * it surpasses that hour mark, causing the range element to change width, which could cause issues
 * with seeking.
 */
export function prettyTime(seconds: number, forcePadHours = false) {
	const hoursRemainder = seconds % 3600,
		hours = Math.floor(seconds / 3600),
		minutesRemainder = hoursRemainder % 60,
		minutes = Math.floor(hoursRemainder / 60);

	const pad = (num: number) => Math.floor(num).toString().padStart(2, '0');

	return (hours > 0 || forcePadHours ? [hours, minutes, minutesRemainder] : [minutes, minutesRemainder])
		.map(pad)
		.join(':');
}

/**
 * Try and find a time range that's buffered that contains the specified video time
 * @param {number} seconds - videoElement.currentTime of a video
 * @param {TimeRanges} bufferedTimeRanges
 */
function findBufferedTimeRange(seconds: number, bufferedTimeRanges: TimeRanges) {
	for (let i = 0; i < bufferedTimeRanges.length; i++) {
		const start = bufferedTimeRanges.start(i),
			end = bufferedTimeRanges.end(i);
		if (seconds > start && end > seconds) {
			return {
				start,
				end,
			};
		}
	}
}

/**
 * Check if the specified time is within some buffered time ranges in the media source buffer.
 */
export function isTimeBuffered(seconds: number, bufferedTimeRanges: TimeRanges) {
	return !!findBufferedTimeRange(seconds, bufferedTimeRanges);
}

/**
 * Figure out if there's enough contiguously buffered video beyond the specified time.
 * This is used to determine if we should buffer a bit more.
 * @param {number} seconds
 * @param {TimeRanges} bufferedTimeRanges
 */
export function isEnoughBuffered(seconds: number, bufferedTimeRanges: TimeRanges) {
	const range = findBufferedTimeRange(seconds, bufferedTimeRanges);
	return range && range.end - seconds > MINIMUM_BUFFER_INTERVAL;
}

export function getTrackTitle(track: ManifestAudioTrack | ManifestSubtitleTrack, trackNumber?: number) {
	const title = (track.title || '') + (track.language ? ` (${track.language})` : '');

	return title || `Audio Track ${trackNumber}`.trim();
}

export function downloadFile(fileName: string, mime: string, text: string) {
	const blob = new Blob([text], { type: mime }),
		a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
}
