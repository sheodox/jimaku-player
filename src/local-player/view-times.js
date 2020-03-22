import settings from './settings';
const viewTimesKey = 'player-view-times';

function getLastViewTimes() {
	return settings.get(viewTimesKey, {});
}

export default {
	set(videoSrc, currentTime, duration) {
		settings.set(
			viewTimesKey,
			Object.assign(getLastViewTimes(), {
				[videoSrc]: {
					currentTime,
					duration
				}
			})
		)
	},
	get(videoSrc) {
		return getLastViewTimes()[videoSrc] || {
			currentTime: 0, maxTime: 1
		}
	}
}