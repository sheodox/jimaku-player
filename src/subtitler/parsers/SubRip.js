import SubtitleFormat from "./SubtitleFormat";

const positionAlignmentTranslates = {
		'line-left': '0%',
		'center': '-50%',
		'line-right': '-100%'
	};

/**
 * Parser for SRT and WebVTT files since WebVTT is more or less a superset of SRT
 */
export default class SubRip extends SubtitleFormat {
	constructor(subripFile, fileName) {
		super('subrip', fileName);
		const start = Date.now();
		this.parse(subripFile);
		this.parseTime = Date.now() - start;
	}
	parse(subripFile) {
		const subs = subripFile
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
			//if any fails parsing, it's probably something we're ignoring for now, like NOTEs etc
			try {
				//vtt subs come numbered on the line above the start/end times, throw it away
				if (/^\d*$/.test(lines[0])) {
					shift();
				}
				let [startStr, endStr] = lines[0]
						//SRT subtitles use a comma for the decimal point on seconds, make it a period so it can be parsed as a float
						.replace(/,/g, '.')
						.match(/^([\d:\.\-> ]*)/)
						[0].split(/\-\->/),
					styling = lines[0].match(/([a-zA-Z].*)/); //the rest of the line starting at the first alphabetical character
				styling = styling && styling.length ? styling[1] : ''; //might not have styling cues

				let inlineStyles = [];
				const linesOfText = lines.length - 1, // -1 because we haven't closed out processing of VTT cues and it's still included
					getMaybePercentCue = (name, fallback) => {
						const match = styling.match(new RegExp(`${name}:([-\\d\\.]*)%?`));
						if (match) {
							return match[1];
						}
						return fallback
					},
					getPercentCue = (name, fallback) => {
						const match = styling.match(new RegExp(`${name}:([\\d\\.]*)%`));
						if (match) {
							return parseInt(match[1], 10);
						}
						return fallback
					},
					getTextCue = name => {
						const match = styling.match(new RegExp(`${name}:([\w-]*?)`));
						if (match) {
							return match[1];
						}
					},
					// only used for position, but it's cleaner to move the logic into a function than muddy the other cue variables below
					getPositionCue = () => {
						//vtt position cues can be specified like "position:50%" which is horizontally 50% across the viewport,
						//alternatively an alignment can be specified which defines what part of the subtitle should be at that
						//position, like "position:50%,center" is totally centered, but "position:30%,line-right" means that the right
						//side of the subtitle is at 30% position, it'll be just in the leftmost side of the viewport

						//note the optional alignment is in a non-capturing group but the alignment within is in a capturing group, so the match
						//for position:50%,center is [..., "50", "center"], not [..., "50", ",center", "center"]
						const match = styling.match(/position:([\d.]*)%(?:,(\w*))?/);
						if (match) {
							return {
								position: parseInt(match[1]),
								//MDN's WebVTT api docs mention "middle" as a center alignment option, and I've seen it in subtitles, though
								//the W3 spec only shows "center" as a valid option. normalize to center for consistency
								positionAlignment: match[2] === 'middle' ? 'center' : match[2]
							}
						}
						return {
							position: 50,
							positionAlignment: 'center'
						};
					};

				let {position, positionAlignment='center'} = getPositionCue(),
					//TODO do something with align, fallback to it instead of positionAlignment having a default 'center'
					align = getTextCue('align') || 'center',
					//TODO support non-percent line numbers
					//need to adjust the fallback line setting slightly, if three lines show it'll go off the screen otherwise
					line = getMaybePercentCue('line', 100),
					size = getPercentCue('size', null);

				const top = {
					[line]: line,
					//TODO need to support other integers, these were the examples on MDN but it sounds like other integers are valid
					'-1': 100,
					'0': 0
				}[line]

				inlineStyles.push(`left: ${position}vw`);

				const positionTransform = `translateX(${positionAlignmentTranslates[positionAlignment]})`;

				inlineStyles.push(`width: ${size ? size + 'vw' : 'max-content'}`);

				shift();
				//now that we've processed all the cues the remaining text is the subtitle text

				const text = lines.join('\n').replace(/<\/?c.Japanese>/g, '');

				//rough estimate of the padding between each lines, on very small players like crunchyroll the
				//space between lines takes up a considerable amount of space, and lines can go off the page
				const paddingEstimateVh = 1,
					paddingBufferZone = linesOfText * paddingEstimateVh,
                    //if the subtitles are going to go off the bottom of the screen (either a high 'line' or
					//a low 'line' + inversion, we want to translate in the Y direction to make the subtitles
					//flow upwards, otherwise they'll overflow off the bottom of the screen
					normalTransform = `transform: ${positionTransform} ` + (top > 75 ? `translateY(-100%)` : ''),
					invertedTransform = `transform: translateY(${top > 75 ? '0%' : '-100%'}) ${positionTransform}`,
					activeMaxTop = `calc(100vh - 100px)`,
					inactiveMaxTop = `${100 - paddingBufferZone}vh`,
					getClampedTop = (val, max) => `top: clamp(${paddingBufferZone}vh, ${val}vh, ${max});`;

				done.push({
					_id: this.genId(),
					start: this.timeToMs(startStr),
					end: this.timeToMs(endStr),
					verticalAlignment: {
						normal: {
							//inactive = the user is just watching, the player controls aren't showing, position as intended
							inactive: `${getClampedTop(top, inactiveMaxTop)} ${normalTransform}`,
							//active = the video may or may not be playing, but the user is doing something,
							//in which case we want to move the subtitle away from the bottom of the screen
							active: `${getClampedTop(top, activeMaxTop)} ${normalTransform}`,
						},
						//normally subtitles grow downward unless a (non "start") line alignment is specified (not currently supported)
						//so for inverted positioning we need to make it grow up, or it'll awkwardly show the subtitle in the center of the video
						inverted: {
							inactive: `${getClampedTop(100 - top, inactiveMaxTop)} ${invertedTransform}`,
							active: `${getClampedTop(100 - top, activeMaxTop)} ${invertedTransform}`,
						}
					},
					text,
					inline: inlineStyles.join('; '),
				});
			} catch(e){}
			return done;
		}, []);
	}

	serialize(atTime) {
		return JSON.stringify(
			typeof atTime === 'number' ? this.getSubs(atTime) : this.subs,
			null,
			4
		);
	}

	debugInfo() {
		return [{
			title: 'Number of subtitles',
			detail: this.subs.length
		}];
	}
}
