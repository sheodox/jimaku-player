// import SubtitleFormat from "./SubtitleFormat";
const SubtitleFormat = require('./SubtitleFormat');

//parser for Advanced SubStation Alpha (.ass) subtitle files
//https://en.wikipedia.org/wiki/SubStation_Alpha#Advanced_SubStation_Alpha

// export default class ASS extends SubtitleFormat {
module.exports = class ASS extends SubtitleFormat {
	/**
	 * @param ass - .ass file contents
	 */
	constructor(ass) {
		super('ass');
		//much easier to parse without carriage returns
		ass = ass.replace(/\r/g, '');
		try {
			this.blocks = this.parseBlocks(ass);
			this.subs = this.parseBlock(this.blocks.subs);
			this.parseSubTimings();
			this.parseStyles(this.parseBlock(this.blocks.styles));
			this.parseSubOverrideTags();
		} catch(e) {
			console.error('ASS PARSE ERROR', e);
			// if we errored out, having no subs is an error condition detected elsewhere
			this.subs = [];
		}
	}

	/**
	 * ASS subtitles have data in INI-like sections, under a header like [Events]
	 * @param ass
	 */
	parseBlocks(ass) {
		//split the ass file by newlines followed by a [, we know those are the start of the headings
		const splitByBlocks = ass.split(/\n(?=\[)/),
			captureBlock = (heading) => {
				const block = splitByBlocks.find(block => {
					//be tolerant of errant spacing, have seen blocks start like " [Script Info]"
					block = block.trim();
					//parse out the text inside the header
					const [_, blockHeading] = block.match(/^\[(.*?)]/);
					return blockHeading === heading;
				});
				//strip out the heading, it'll be the only thing on the first line
				return block
					.replace(/.*\n/, '').trim();
			};

		return {
			info: captureBlock('Script Info'),
			styles: captureBlock('V4+ Styles'),
			subs: captureBlock('Events')
		};
	}

	/**
	 * The [V4+ Style] and [Events] blocks come with data in a CSV-like format, this
	 * will create objects that match up the 'column headers' present in the "Format" line
	 * with the data in each line that follows it.
	 *
	 * The subtitles will look roughly like this:
	 * Format: Layer, Start, End, Text
	 * Dialogue: 0,0:00:02.43,0:00:03.54,了解しました
	 * Dialogue:...
	 *
	 * This function will transform that to something like:
	 * [{
	 *     dataType: 'dialogue',
	 *     layer: "0",
	 *     start: "0:00:02.43",
	 *     end: "0:00:03.54",
	 *     text: "了解しうました"
	 * }, ...]
	 */
	parseBlock(block) {
		//the first line is a 'Format' line, which specifies the data that each comma separated value on the following lines represent
		const [formatLine, ...subs] = block.split('\n');

		const parseLine = (line, attrMax=Infinity) => {
			// each line will be something like "Dialogue: 2,3,5" etc, keep The first bit tells us what kind of line it is
			// and the rest are comma separated attributes. The first line is the format line, which specifies the names
			// of each comma separated attribute that's on each following line
			let [_, lineType, attributes] = line.match(/(\w*): (.*)/);

			attributes = attributes.split(',');
			//if the last attribute has commas in it, we'll exceed the number of attributes the Format
			//line specifies, so we need to re-assemble anything that exceeds that limit into the last
			//attribute's place. this can also happen as the result of override tags.
			//
			// ex:
			//Format: Start, End, Text
			//Dialogue: 0,1,{\pos(424,12)}Hello, World!
			//just splitting on commas would give us the attributes:
			//["0", "1", "{\pos(424", "12)}Hello", " World!"]
			//but it should be
			//["0", "1", "{\pos(424,12)}Hello World!"]
			if (attributes.length > attrMax) {
				attributes[attrMax - 1] = attributes.slice(attrMax - 1).join(',');
				attributes.splice(attrMax, Infinity);
			}

			return {
				type: lineType,
				attributes: attributes
			}
		};
		const format = parseLine(formatLine);

		return subs.reduce((done, line) => {
			//skip blank lines and comments
			if (!line || line.charAt(0) === ';' || line.indexOf('Comment: ') === 0) {
				return done;
			}
			const lineData = parseLine(line, format.attributes.length);
			//zip the attributes with the format names
			const zipped = {
				dataType: lineData.type.toLowerCase()
			};

			format.attributes.forEach((columnHeader, index) => {
				columnHeader = columnHeader.trim();
				//camel case
				const propName = columnHeader.charAt(0).toLowerCase() + columnHeader.substring(1);
				zipped[propName] = lineData.attributes[index];
			});

			// sometimes *Default === Default, just make anything here and in styles that use either just be "Default"
			zipped.style = zipped.style === '*Default' ? 'Default' : zipped.style;
			done.push(zipped);

			return done;
		}, [])
	}
	parseSubTimings() {
		this.subs.forEach(sub => {
			sub.start = this.timeToMs(sub.start);
			sub.end = this.timeToMs(sub.end);
		})
	}

	parseStyles(styles) {
		const parseColor = assColor => {
			if (assColor) {
				//todo - support shorthand colors?
				const [_, alpha, blue, green, red] = assColor.match(/&H([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i);
				//seems the alpha color is often 00 used to pad numbers when it's not actually needed, ignore 00 alpha because then everything is invisible
				return `#${red}${green}${blue}${alpha === '00' ? '' : alpha}`
			}
		};

		const parsedStyles = {};
		styles.forEach(style => {
			/**
			 * Colors and stuff are weird in the ASS spec, they're in a backwards order (AABBGGRR) to rgba
			 */

			for (const colorKey of Object.keys(style).filter(k => /colour/i.test(k))) {
				style[colorKey] = parseColor(style[colorKey]);
			}

			// sometimes *Default === Default, just make anything here and in subs that use either just be "Default"
			style.name = style.name === '*Default' ? 'Default' : style.name;

			//figure out all the inline styles that will be needed to render the sub, do it once now so
			//Subtitles.svelte doesn't end up doing this on every frame
			const inlineStyle = [],
				//for boolean values, ASS considers -1 to be true and 0 to be false
				assTrue = '-1',
				{
					primaryColour, secondaryColour, outlineColour, backColour, borderStyle, outline,
					shadow, fontname, fontsize, bold, italic, underline, strikeOut
				} = style;

			if (primaryColour) {
				inlineStyle.push(`color: ${primaryColour}`)
			}
			if (fontname) {
				inlineStyle.push(`font-family: "${fontname}"`);
			}
			if (fontsize) {
				inlineStyle.push(`font-size: ${fontsize}pt`);
			}

			if (borderStyle === '1') { //outline + drop shadow
				const color = outlineColour || backColour,
					o = `${typeof outline !== 'number' ? 1 : outline}px`;
				inlineStyle.push(`text-shadow: ${color} ${o} ${o}, ${color} ${o} -${o}, ${color} -${o} ${o}, ${color} -${o} -${o}, ${color} ${o} 0, ${color} 0 ${o}, ${color} -${o} 0, ${color} 0 -${o}, ${shadow}px ${shadow}px ${color}`);
			}
			else if (borderStyle === '3') { //opaque box
				inlineStyle.push(`background-color: ${backColour}`);
			}

			if (bold === assTrue) {
				inlineStyle.push(`font-weight: bold`);
			}
			if (italic === assTrue) {
				inlineStyle.push(`font-style: italic`)
			}
			if (underline === assTrue || strikeOut === assTrue) {
				inlineStyle.push(`text-decoration: ${underline === assTrue ? 'underline': ''} ${strikeOut === assTrue ? 'line-through' : ''}`)
			}

			parsedStyles[style.name] = {
				inline: inlineStyle.join(';'),
				//keep parsed styles as-is for debugging
				raw: style
			};
		});

		this.styles = parsedStyles;
	}
	parseSubOverrideTags() {
		//todo - parse override tags, all kinds of cool effects can be present
		//http://docs.aegisub.org/3.2/ASS_Tags/
	}
};
