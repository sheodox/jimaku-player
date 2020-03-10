import SubtitleFormat from "./SubtitleFormat";
/**
 * Parser for SRT files. Can return an array of subtitles and their styling at any point in time during a video.
 */
export default class SRT extends SubtitleFormat {
	constructor(srt, fileName) {
		super('srt', fileName);

		const subs = srt
			.replace(/\r/g, '')
			//two lines separate each subtitle line
			.split('\n\n');
		this.subs = subs.reduce((done, sub) => {
			let lines = sub.trim().split('\n');

			/**
			 * shift the array of lines for this sub entry, consider the current index 0 line processed
			 */
			function shift() {
				lines.shift();
			}
			try {
				//sometimes subs come numbered with a number on the line above the start/end times, throw it away
				if (/^\d*$/.test(lines[0])) {
					shift();
				}
				let [startStr, endStr] = lines[0]
						//second decimal point could be a comma, make it a period
						.replace(/,/g, '.')
						.match(/^([\d:\.\-> ]*)/)
						[0].split(/\-\->/),
					styling = lines[0].match(/([a-zA-Z].*)/); //the rest of the line starting at the first alphabetical character
				styling = styling && styling.length ? styling[1] : ''; //might not have styling cues

				const getPercentCue = name => {
						const match = styling.match(new RegExp(`${name}:([\\d\\.]*)%`));
						if (match) {
							return parseInt(match[1], 10) / 100;
						}
					},
					//percentage of the total line area that is taken up by this subtitle
					line = getPercentCue('line') || 1;
				shift();

				done.push({
					start: this.timeToMs(startStr),
					end: this.timeToMs(endStr),
					text: lines.join('\n').replace(/<\/?c.Japanese>/g, ''),
					line
				});
			} catch(e){}
			return done;
		}, []);
	}

	serialize() {
		return JSON.stringify(this.subs, null, 4);
	}

	debugInfo() {
		return [{
			title: 'Number of subtitles',
			detail: this.subs.length
		}];
	}
}
