const MS_MINUTE = 60 * 1000,
	MS_HOUR = 60 * MS_MINUTE,
	MAX_ALIGNMENT_CANDIDATES = 20,
	//when searching, this is the number of subsequent subtitles to show after every match
	MAX_SUBSEQUENT_CANDIDATES = 3,
	//the max number of results (and their subsequent subtitles) that should be returned,
	//prevent showing too many results if something very generic is searched
	MAX_SEARCH_RESULTS = 5;

const clone = sub => Object.assign({}, sub);

// export default class SubtitleFormat {
module.exports = class SubtitleFormat {
	constructor(format, fileName) {
		this.format = format;
		this.fileName = fileName;
		this.subs = [];
		this.generatedIdBase = 0;
	}

	genId() {
		//for accurate tracking of the iteration keys svelte needs something guaranteed to be unique,
		//otherwise it will lose track of subtitles and the text wont' disappear. this is used everywhere
		//that a subtitle is iterated to have unique ID instead of hoping the subtitle text is unique
		return `generated-id-${this.generatedIdBase++}`;
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
	prettyTimeDifference(start, end) {
		return `+${parseFloat(((end - start) / 1000).toFixed(1))} seconds`
	}
	getAlignmentCandidates(searchText) {
		let subs = this.subs;
			//the array of subtitles are filtered by time anyway, so sorting in-place by start time shouldn't have any issues
		subs.sort((a, b) => {
				return a.start - b.end;
			});

		//aligning by clicking the subtitle you just heard and searched for wouldn't be very helpful, because you'd probably
		//end up a couple seconds to late, so we want to show the following few lines so they can align to one of those lines
		if (searchText) {
			return subs
				.reduce((captured, sub, index) => {
					if (sub.text.includes(searchText)) {
						const startIndex = index + 1,
							subsequent = subs.slice(startIndex, startIndex + MAX_SUBSEQUENT_CANDIDATES)
								.map(clone)
								.map(subsequentSub => {
									subsequentSub.offset = this.prettyTimeDifference(sub.start, subsequentSub.start);
									return subsequentSub;
								});
						captured.push({type: 'search-match', sub, subsequent});
					}
					return captured;
				}, [])
				.slice(0, MAX_SEARCH_RESULTS);
		}
		else {
			return subs
				//limit the results to a manageable amount
				.slice(0, MAX_ALIGNMENT_CANDIDATES)
				.map(clone)
				.map(sub => {
					sub.offset = this.prettyTimeDifference(subs[0].start, sub.start);
					return sub;
				});
		}

	}
};