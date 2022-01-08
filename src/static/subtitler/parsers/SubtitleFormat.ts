const MS_MINUTE = 60 * 1000,
	MS_HOUR = 60 * MS_MINUTE,
	MAX_ALIGNMENT_CANDIDATES = 20,
	//when searching, this is the number of subsequent subtitles to show after every match
	MAX_SUBSEQUENT_CANDIDATES = 3,
	//the max number of results (and their subsequent subtitles) that should be returned,
	//prevent showing too many results if something very generic is searched
	MAX_SEARCH_RESULTS = 5;

const clone = <T>(sub: T): T => Object.assign({}, sub);

export interface SubtitleBase {
	_id: string;
	text: string;
	start: number;
	end: number;
	offset?: string;
	type: 'ass' | 'subrip';
}

export interface SubtitleSearchResults {
	sub: SubtitleBase;
	type: 'search-match';
	subsequent: SubtitleBase[];
}

// export default class SubtitleFormat {
export class SubtitleFormat<T extends SubtitleBase> {
	fileName: string;
	subs: T[];
	generatedIdBase: number;

	constructor(fileName: string) {
		this.fileName = fileName;
		this.subs = [];
		this.generatedIdBase = 0;
	}

	//IDs are generated for every subtitle line
	genId() {
		return `generated-id-${this.generatedIdBase++}`;
	}

	getSubs(ms: number) {
		return this.subs.filter((sub) => {
			return sub.start <= ms && sub.end >= ms;
		});
	}
	// convert a time stamp in hh:mm:ss format (seconds can be a floating point number)
	timeToMs(timeStr: string) {
		const [hours, minutes, seconds] = timeStr.split(':');

		return +hours * MS_HOUR + +minutes * MS_MINUTE + parseFloat(seconds) * 1000;
	}
	prettyTimeDifference(start: number, end: number) {
		return `+${parseFloat(((end - start) / 1000).toFixed(1))} seconds`;
	}
	getAlignmentCandidates(searchText?: string): SubtitleSearchResults[] | SubtitleBase[] {
		//the array of subtitles are filtered by time anyway, so sorting in-place by start time shouldn't have any issues
		this.subs.sort((a, b) => {
			return a.start - b.end;
		});

		//aligning by clicking the subtitle you just heard and searched for wouldn't be very helpful, because you'd probably
		//end up a couple seconds to late, so we want to show the following few lines so they can align to one of those lines
		if (searchText) {
			return this.subs
				.reduce((captured, sub, index) => {
					if (sub.text.includes(searchText)) {
						const startIndex = index + 1,
							subsequent = this.subs
								.slice(startIndex, startIndex + MAX_SUBSEQUENT_CANDIDATES)
								.map(clone)
								.map((subsequentSub) => {
									subsequentSub.offset = this.prettyTimeDifference(sub.start, subsequentSub.start);
									return subsequentSub;
								});
						captured.push({ type: 'search-match', sub, subsequent });
					}
					return captured;
				}, [])
				.slice(0, MAX_SEARCH_RESULTS);
		} else {
			return (
				this.subs
					//limit the results to a manageable amount
					.slice(0, MAX_ALIGNMENT_CANDIDATES)
					.map(clone)
					.map((sub) => {
						sub.offset = this.prettyTimeDifference(this.subs[0].start, sub.start);
						return sub;
					})
			);
		}
	}
}
