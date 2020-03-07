// import SubtitleFormat from "./SubtitleFormat";
const SubtitleFormat = require('./SubtitleFormat');

//parser for Advanced SubStation Alpha (.ass) subtitle files
//https://en.wikipedia.org/wiki/SubStation_Alpha#Advanced_SubStation_Alpha

const camelCase = string => {
	return (string.charAt(0).toLowerCase() + string.substring(1)).replace(' ', '');
};

const parseColor = assColor => {
	if (assColor) {
		assColor = assColor.replace(/[&H]/g, '');
		assColor = assColor.padStart(8, '0');
		const [_, alpha, blue, green, red] = assColor.match(/([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i),
			fromHex = num => parseInt(num, 16);
		//alpha channel numbers are backwards from CSS hex colors, need to invert it
		return `rgba(${fromHex(red)}, ${fromHex(green)}, ${fromHex(blue)}, ${255 - fromHex(alpha)})`
	}
};

const genOutlineStyles = (outlineColor, outlineWidth, shadowColor='transparent', shadowDepth=0, blur=0) => {
	const color = outlineColor || shadowColor;
	shadowDepth *= 2;
	blur = `${blur}px`;

	//make the outline a bit stronger, seems to need it when comparing to VLC's rendered subtitles
	outlineWidth = (typeof outlineWidth === 'undefined' ? 1 : outlineWidth) * 2;
	const outlines = [];
	//make a ton of stacking shadows, because otherwise thicker outlines won't appear smooth
	for (let i = -1 * outlineWidth; i <= outlineWidth; i++) {
		for (let j = -1 * outlineWidth; j <= outlineWidth; j++) {
			outlines.push(`${i}px ${j}px ${blur} ${color}`);
		}
	}
	return `text-shadow: ${outlines.join(', ')}, ${shadowDepth}px ${shadowDepth}px ${blur} ${shadowColor}`
};

/**
 * Generator for parsing out blocks of override tags and the text that follows it.
 * This turns:
 * {\fs12}Some small text {\fs24}Some big text
 * Into:
 * yields: {\fs12}Some small text
 * yields: {\f24}Some big text
 * @param subtitleText
 * @returns {Generator<*, void, ?>}
 */
function* overrideScanner(subtitleText) {
	const nextOverriddenTextReg = /({.*?}[^{]*)/g;
	let next;

	while ((next = nextOverriddenTextReg.exec(subtitleText)) !== null) {
		yield next[1]
	}
}

function getOverride(overrides, overrideCode, isComplex=false) {
	const overrideReg = new RegExp(
		isComplex ?
			`\\\\${overrideCode}\\((.*?)\\)` :
			`\\\\${overrideCode}([^\\\\}]*)`
		),
		overrideMatch = overrides.match(overrideReg);

	if (!overrideMatch) {
		return;
	}
	return {
		//pass the overrides back that don't contain this override anymore
		overrides: overrides.replace(overrideMatch[0], ''),
		params: isComplex ? overrideMatch[1].split(',') : overrideMatch[1]
	};
}

// export default class ASS extends SubtitleFormat {
module.exports = class ASS extends SubtitleFormat {
	/**
	 * @param ass - .ass file contents
	 */
	constructor(ass, fileName) {
		super('ass', fileName);
		//much easier to parse without carriage returns, keep in mind though that \r is also a 'reset' override tag
		ass = ass.replace(/\r\n/g, '\n');
		try {
			this.blocks = this.parseBlocks(ass);
			this.subs = this.parseBlock(this.blocks.subs);
			this.parseInfo(this.blocks.info);
			this.parseSubTimings();
			this.parseStyles(this.parseBlock(this.blocks.styles));
			this.parseSubOverrideTags();
		} catch(e) {
			console.error('ASS PARSE ERROR', e);
			// if we errored out, having no subs is an error condition detected elsewhere
			this.subs = [];
		}
	}

	serialize() {
		return JSON.stringify({
			info: this.info,
			styles: this.styles,
			subs: this.subs,
		}, null, 4);
	}

	debugInfo() {
		return [{
			title: 'Number of styles',
			detail: Object.keys(this.styles).length
		}, {
			title: 'Number of subtitles',
			detail: this.subs.length
		}];
	}

	parseInfo() {
		this.info = {};
		this.blocks.info
			.split('\n')
			.forEach(line => {
				const [key, value] = line.split(': ');
				this.info[camelCase(key)] = value;
			})
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
				const propName = camelCase(columnHeader);
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
				inlineStyle.push(genOutlineStyles(outlineColour, outline, backColour, shadow));
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
		/**
		 * Subtitles can have "overrides" which are like the inline-style of .ass subtitles. They apply to that
		 * single line of subtitles, and are cumulative for the line unless they're reset or overridden by another
		 * setting for the same
		 *
		 *
		 * Assume we've got the following subtitles:
		 * {\b1}いいよ。{\i1}というかなんで
		 * They should be parsed like:
		 * [{inline: 'font-weight: bold', text: 'いいよ。'}, {inline: 'font-weight: bold; font-style: italic', text: 'というかなんで'}]
		 * Because the styles are cumulative. If a later style overwrites it with something else, the browser will handle displaying
		 * only the second one. So all styles need to be able to add or remove styles
		 */
		this.subs.forEach(sub => {
			//keep the unchanged text around for debugging purposes
			sub.rawText = sub.text;

			//if we don't double escape N, we'll have a newline plus a slash
			sub.text = sub.text.replace('\\N', '\n');

			//just ignore lines with no overrides
			if (!/{.+?}/.test(sub.text)) {
				return;
			}

			const removeOverrideText = text => text.replace(/{.*?}/g, '');

			sub.styledText = [];
			//create a scanner for overrides and the text that immediately follows them
			const scanner = overrideScanner(sub.text);
			//with each override block (unless we hit a reset, \r), we're going to be building upon whatever overrides
			//we've parsed so far.
			let cumulativeStyles = [];
			//go block by block of overridden text
			for (const text of scanner) {
				const containerInline = [],
					styled = {
					text: removeOverrideText(text),
					fadeIn: 0,
					fadeOut: 0,
					inline: ''
				};

				let [overrides] = text.match(/{.*?}/);
				function checkOverride(code, isComplex=false, fn=()=>{}) {
					const results = getOverride(overrides, code, isComplex);
					if (results) {
						fn(results.params);
						overrides = results.overrides;
					}
				}

				//todo - parse more tags
				//http://docs.aegisub.org/3.2/ASS_Tags/

				//not actually handling these yet, but they can interfere with other
				//overrides, so pretend to process them so they're not in the override string
				checkOverride('fscx');
				checkOverride('fscy');


				//outline and shadow use a bunch of text-shadows, so they need to all be parsed at once, and their result computed
				let outlineColor,
					shadowColor,
					outlineSize,
					shadowDepth,
					blur;
				checkOverride('3c', false, color => {
					outlineColor = color;
				});
				checkOverride('4c', false, color => {
					shadowColor = color;
				});
				checkOverride('bord', false, size => {
					outlineSize = size;
				});
				checkOverride('shad', false, depth => {
					shadowDepth = depth;
				});
				//both blur and be can be overrides for blurred edges, but it seems blurs are much stronger.
				//to ASS subs than text-shadow uses, so multiply it by a bit.
				//docs say 'blur' works better than 'be' at high strengths so just guessing the blurring should
				//be stronger for 'be' overrides, but multiply both by a bit to exaggerate the effect
				checkOverride('blur', false, b => {
					blur = 3 * b;
				});
				checkOverride('be', false, be => {
					blur = 5 * be;
				});
				//if any of them are defined, merge them in with the applied style's definitions, then generate an outline/shadow style
				if ([outlineColor, shadowColor, outlineSize, shadowDepth, blur].some(p => typeof p !== "undefined")) {
					const baseStyle = this.styles[sub.style],
						useOrFallback = (value, fallbackProp) => typeof value !== "undefined" ? value : baseStyle.raw[fallbackProp];
					// just in case there's no style applied? unsure if that's possible, but checking just in case
					if (baseStyle) {
						outlineColor = useOrFallback(parseColor(outlineColor), 'outlineColour');
						shadowColor = useOrFallback(parseColor(shadowColor), 'backColour');
						outlineSize = useOrFallback(outlineSize, 'outline');
						shadowDepth = useOrFallback(shadowDepth, 'shadow');
						//not using a blur fallback, because blur is only ever defined in an override it seems
						cumulativeStyles.push(genOutlineStyles(outlineColor, outlineSize, shadowColor, shadowDepth, blur));
					}
				}

				checkOverride('pos', true, ([x, y]) => {
					//try and scale the x/y coordinates to percentages based on the player sizes
					x = 100 * (+x / +this.info.playResX);
					y = 100 * (+y / +this.info.playResY);

					//positioning applies to the line, and if we just put it on this span it might get put in the right space, but the
					//containing paragraph elements will stack, possibly overlapping the video controls if
					containerInline.push(`position: fixed; left: ${x}vw; top: ${y}vh`);
				});

				checkOverride('fad', true, ([fadeIn, fadeOut]) => {
					styled.fadeIn = fadeIn;
					styled.fadeOut = fadeOut;
					//svelte will not start animating until the sub is done showing and not before,
					//so we need to subtract the amount of fadeout time from the subtitle's end time so it works
					sub.end -= fadeOut;
				});

				checkOverride('fsp', false, spacing => {
					cumulativeStyles.push(`letter-spacing: ${spacing}px`)
				});

				checkOverride('fs', false, fontSize => {
					cumulativeStyles.push(`font-size: ${fontSize}pt`);
				});

				//need to handle underline and strike through decorations at the same time, because it's the same css property
				const textDecorationOptions = [];
				checkOverride('u', false, underlined => {
					textDecorationOptions.push('underline');
				});
				checkOverride('s', false, striked => {
					textDecorationOptions.push('line-through');
				});
				cumulativeStyles.push(`text-decoration: ${textDecorationOptions.length ? textDecorationOptions.join(' ') : 'none'}`);

				checkOverride('b', false, bolded => {
					cumulativeStyles.push(`font-weight: ${bolded ? 'bold' : 'normal'}`);
				});

				checkOverride('i', false, italic => {
					cumulativeStyles.push(`font-style: ${italic ? 'italic' : 'normal'}`);
				});

				checkOverride('fn', false, fn => {
					cumulativeStyles.push(`font-family: "${fn}"`);
				});

				//colors
				checkOverride('1c', false, color => {
					cumulativeStyles.push(`color: ${parseColor(color)}`)
				});



				checkOverride('r', false, style => {
					//if we're not switching to another style, just blank out the styles
					cumulativeStyles = style ? [this.styles[style].inline] : [];
				});


				styled.inline = cumulativeStyles.join(';');
				sub.styledText.push(styled);
				if (containerInline.length) {
					sub.inline = containerInline.join(';');
				}
			}

			//now that we've finished parsing all overrides, we should remove overrides from the plain text, otherwise they'll
			//have to be handled wherever we're not showing styled text (alignment button and jisho searches)
			sub.text = removeOverrideText(sub.text);
		});
	}
};
