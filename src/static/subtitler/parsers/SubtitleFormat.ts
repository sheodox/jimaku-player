const MS_MINUTE = 60 * 1000,
	MS_HOUR = 60 * MS_MINUTE,
	MAX_ALIGNMENT_CANDIDATES = 20,
	//when searching, this is the number of subsequent subtitles to show after every match
	MAX_SUBSEQUENT_CANDIDATES = 3,
	//the max number of results (and their subsequent subtitles) that should be returned,
	//prevent showing too many results if something very generic is searched
	MAX_SEARCH_RESULTS = 5,
	// this is how many subs *before* the most recent subtitle we want to show in "Recent Subtitles"
	// so the total shown is one more than this
	SUB_HISTORY_QUANTITY = 9;

const clone = <T>(sub: T): T => Object.assign({}, sub);

// svelte doesn't decode html entities at runtime in expressions, so we need to map
// any entities people have encountered to their equivalents
const htmlEntityReplacements: [RegExp, string][] = [
	[/&lrm;/g, ''], // left-right-mark, until told otherwise I don't think we need this
];

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
	// after parsing subtitles we store an array of all subtitles in here,
	// to use when figuring out the recent subtitles, as this filters out
	// all subtitles that don't have displayable text (usually ASS svg paths)
	// because we only want to show recognizable subtitles in the history
	// and we'd get inconsistent amounts of recent subs if we used this.subs
	// and also tried filtering out non-text subtitles
	private subsWithValidText: T[];
	generatedIdBase: number;

	constructor(fileName: string) {
		this.fileName = fileName;
		this.subs = [];
		this.generatedIdBase = 0;
	}

	// after the subtitles have been parsed, do some stuff to prepare for use
	finish() {
		//order all the subtitles by start time, so history makes sense (sometimes ending subs are at the beginning of the script)
		this.subs.sort((a, b) => a.start - b.start);

		// we need to only consider subtitles with actual text on them for the "Recent Subtitles" tab in the tray
		// and it's a lot easier to do math deciding what to show when we have an array of those subs only
		this.subsWithValidText = this.subs.filter((s) => !!s.text);
	}

	cleanSubtitleText(text: string) {
		for (const [test, replacement] of htmlEntityReplacements) {
			text = text.replace(test, replacement);
		}
		return text;
	}

	//IDs are generated for every subtitle line
	genId() {
		return `generated-id-${this.generatedIdBase++}`;
	}

	getSubs(ms: number) {
		let mostRecentlyStartedSubtitleWithTextIndex: number | null = null;

		const currentSubtitles = this.subs.filter((sub, index) => {
				// keep looking for the last subtitle with displayable text that should actually show in the history
				if (sub.text && sub.start <= ms) {
					mostRecentlyStartedSubtitleWithTextIndex = index;
				}
				return sub.start <= ms && sub.end >= ms;
			}),
			// try and find the ID of the most recent subtitle we want to show under "Recent Subtitles"
			lastDisplayableSubId = this.subs[mostRecentlyStartedSubtitleWithTextIndex]?._id ?? null,
			// get the index within the text-only copy of subtitles for the most recent subtitle
			lastSubsValidTextIndex = lastDisplayableSubId
				? this.subsWithValidText.findIndex((sub) => sub._id === lastDisplayableSubId)
				: -1;

		return {
			subs: currentSubtitles,
			history:
				lastSubsValidTextIndex !== -1
					? this.subsWithValidText
							// slice to +1 to be inclusive of the most recent subtitle
							.slice(Math.max(0, lastSubsValidTextIndex - SUB_HISTORY_QUANTITY), lastSubsValidTextIndex + 1)
							// reverse so it shows newest first
							.reverse()
					: [],
		};
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
