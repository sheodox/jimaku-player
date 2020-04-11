const MS_MINUTE = 60 * 1000,
	MS_HOUR = 60 * MS_MINUTE,
	MAX_ALIGNMENT_CANDIDATES = 20;

// export default class SubtitleFormat {
module.exports = class SubtitleFormat {
	constructor(format, fileName) {
		this.format = format;
		this.fileName = fileName;
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
	getAlignmentCandidates() {
		return this.subs
			//the array of subtitles are filtered by time anyway, so sorting in-place by start time shouldn't have any issues
			.sort((a, b) => {
				return a.start - b.end;
			})
			.slice(0, MAX_ALIGNMENT_CANDIDATES);
	}
};