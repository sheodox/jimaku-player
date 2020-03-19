import settings from './settings';
const viewTimesKey = 'player-view-times';

function getLastViewTimes() {
	return settings.get(viewTimesKey, {});
}

export default {
	set(videoSrc, time) {
		settings.set(
			viewTimesKey,
			Object.assign(getLastViewTimes(), {
				[videoSrc]: time
			})
		)
	},
	get(videoSrc) {
		return getLastViewTimes()[videoSrc] || 0
	}
}