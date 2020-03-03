const MS_MINUTE = 60 * 1000,
	MS_HOUR = 60 * MS_MINUTE;

export default class SubtitleFormat {
	constructor(format) {
		this.format = format;
		this.subs = [];
	}

	getSubs(ms) {
		return this.subs.filter(sub => {
			return sub.start <= ms && sub.end >= ms;
		});
	}
	timeToMs(timeStr) {
		const [
			hours, minutes, seconds
		] = timeStr.split(':');

		return (+hours * MS_HOUR) + (+minutes * MS_MINUTE) + (parseFloat(seconds) * 1000);
	}
	firstSubtitle() {
		// there's a possibility subs[0] isn't the first sub, find the earliest start time
		return this.subs.reduce((best, next) => {
			return next.start < best.start ? next : best;
		}, {start: Infinity})
	}
}