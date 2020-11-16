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
	blur = `${blur}px`;

	outlineWidth = (typeof outlineWidth === 'undefined' ? 1 : outlineWidth);
	const outlines = [];
	//make a ton of stacking shadows, because otherwise thicker outlines won't appear smooth
	for (let i = -1 * outlineWidth; i <= outlineWidth; i++) {
		for (let j = -1 * outlineWidth; j <= outlineWidth; j++) {
			outlines.push(`${i}px ${j}px ${blur} ${color}`);
		}
	}
	return `text-shadow: ${outlines.join(', ')}, ${shadowDepth}px ${shadowDepth}px ${blur} ${shadowColor}`
};

const genFontFamily = fontName => {
	return `font-family: "${fontName}", "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", Meiryo, "游ゴシック", YuGothic, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif`
};

const genAlignment = (alignmentCode, marginL='0vw', marginR='0vw', marginV='0vh') => {
	//unless you're using the legacy \a alignment override, the alignments are like the 1-9 keys on the number pad,
	//so for example 1=bottom left, 5=middle center, 9=top right, that point is its anchor, so the text needs to be
	//translated to not go off screen or not be in a weird place. so alignment 9 should be translated so its as if
	//the text grows down and to the left. likewise alignment 1 should be translated to grow upwards and to the right.
	//
	//additionally, the margins need to be taken into account to pull the text away from the edges of the screen,
	//otherwise they'll go off the screen if we just use these positions and add a margin css rule
	const positions = {
			1: `top: calc(100vh - ${marginV}); left: ${marginL}; transform: translate(0, -100%)`,
			2: `top: calc(100vh - ${marginV}); left: 50vw; transform: translate(-50%, -100%)`,
			3: `top: calc(100vh - ${marginV}); left: calc(100vw - ${marginR}); transform: translate(-100%, -100%)`,
			4: `top: 50vh; left: ${marginL}; transform: translate(0, -50%)`,
			5: `top: 50vh; left: 50vw; transform: translate(-50%, -50%)`,
			6: `top: 50vh; left: calc(100vw - ${marginR}); transform: translate(-100%, -50%)`,
			//growth in the y direction is the natural way text grows on the web for the top alignments, only need an X correction
			7: `top: ${marginV}; left: ${marginL}`,
			8: `top: ${marginV}; left: 50vw; transform: translateX(-50%)`,
			9: `top: ${marginV}; left: calc(100vw - ${marginR}); transform: translateX(-100%)`,
		},
		//to create alignments that can be inverted using the tray option, this is used to flip the alignment vertically
		invertedAlignments = {
			1: 7,
			2: 8,
			3: 9,
			4: 4,
			5: 5,
			6: 6,
			7: 1,
			8: 2,
			9: 3
		},
		genStyle = alignment => `position:fixed;${positions[alignment]}`;

	return {
		normal: genStyle(alignmentCode),
		inverted: genStyle(invertedAlignments[alignmentCode])
	}
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

	//don't skip text with no overrides at the start
	const firstOverrideIndex = subtitleText.indexOf('{');
	if (firstOverrideIndex > 0) {
		yield subtitleText.substring(0, firstOverrideIndex);
	}

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

	scaleHeight(height) {
		//fonts in ASS files are meant to be equivalent to px, but they need to scale compared to the size of the video they were expecting,
		//since we know expected video resolutions we can scale the subtitles into vh units so it'll automatically scale. this can also
		//be used by pos override tags
		return `${100 * (height / +this.info.playResY)}vh`;
	}
	scaleWidth(width) {
		return `${100 * (width / +this.info.playResX)}vw`;
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
			zipped._id = this.genId();
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
				//for boolean values within the style declarations ASS considers -1 to be true and 0 to be false,
				//note this is different in overrides
				assTrue = '-1',
				{
					primaryColour, secondaryColour, outlineColour, backColour, borderStyle, outline,
					shadow, fontname, fontsize, bold, italic, underline, strikeOut, alignment,
					marginL, marginR, marginV
				} = style;

			//these styles might always be defined, so maybe we don't need to safety check any of these
			if (primaryColour) {
				inlineStyle.push(`color: ${primaryColour}`);
			}
			if (fontname) {
				inlineStyle.push(genFontFamily(fontname));
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
				inlineStyle.push(`font-style: italic`);
			}
			if (underline === assTrue || strikeOut === assTrue) {
				inlineStyle.push(`text-decoration: ${underline === assTrue ? 'underline': ''} ${strikeOut === assTrue ? 'line-through' : ''}`);
			}
			inlineStyle.push(this.genScaledFont(fontsize));

			parsedStyles[style.name] = {
				inline: inlineStyle.join(';'),
				verticalAlignment: genAlignment(
					alignment,
					this.scaleWidth(marginL),
					this.scaleWidth(marginR),
					this.scaleHeight(marginV),
				),
				//keep parsed styles as-is for debugging
				raw: style
			};
		});

		this.styles = parsedStyles;
	}

	genScaledFont(fontSize) {
		return `font-size: ${this.scaleHeight(fontSize * 0.75)}`
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

			sub.text = sub.text
				//\n is a soft line break where the subtitle renderer can choose if it needs a line break here,
				//essentially a <wbr> but it's easier to ignore that for now and treat it as a space
				.replace(/\\n/g, ' ')
				//these characters need to be double escaped
				.replace(/\\N/g, '\n') //hard new line
				//subtitles are rendered with `white-space:pre` so just using a space character for a hard space should be enough
				.replace(/\\h/g, ' '); //hard space

			//just ignore lines with no overrides
			if (!/{.+?}/.test(sub.text)) {
				return;
			}

			sub.phrases = [];

			const removeOverrideText = text => text.replace(/{.*?}/g, '');

			//create a scanner for overrides and the text that immediately follows them
			const scanner = overrideScanner(sub.text);
			//with each override block (unless we hit a reset, \r), we're going to be building upon whatever overrides
			//we've parsed so far.
			let cumulativeStyles = [];
			//go block by block of overridden text
			for (const text of scanner) {
				const containerInline = [],
					styled = {
						_id: this.genId(),
						text: removeOverrideText(text),
						fadeIn: 0,
						fadeOut: 0,
						inline: ''
					};

				let overridesMatch = text.match(/{.*?}/),
					overrides = overridesMatch ? overridesMatch[0] : '';

				function checkOverride(code, isComplex=false, fn=()=>{}) {
					const results = getOverride(overrides, code, isComplex);
					if (results) {
						fn(results.params);
						overrides = results.overrides;
					}
				}

				/**
				 * Check multiple override codes at once, for things that depend all on the same CSS property
				 * @param codes - array of override tags
				 * @param isComplex - boolean (or array of booleans matching each code) determining if the override
				 * tag is complex (has multiple comma separated arguments in parenthesis)
				 * @param fn
				 */
				function checkMultipleOverrides(codes, isComplex, fn) {
					const overrideResults = codes.map((code, index) => {
						const complex = Array.isArray(isComplex) ? isComplex[index] : isComplex;

						const results = getOverride(overrides, code, complex);
						if (results) {
							overrides = results.overrides;
							return results.params;
						}
					});

					if (overrideResults.some(r => r !== undefined)) {
						fn(...overrideResults);
					}
				}

				//todo - parse more tags
				//http://docs.aegisub.org/3.2/ASS_Tags/

				//not actually handling these yet, but they can interfere with other
				//overrides, so pretend to process them so they're not in the override string
				checkOverride('fscx');
				checkOverride('fscy');

				checkOverride('an', false, alignmentCode => {
					const srcStyle = this.styles[sub.style];
					sub.verticalAlignment = genAlignment(
						alignmentCode,
						this.scaleWidth(srcStyle.raw.marginL),
						this.scaleWidth(srcStyle.raw.marginR),
						this.scaleHeight(srcStyle.raw.marginV),
					)
				});


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
				checkOverride('blur', false, b => {
					blur = b;
				});
				checkOverride('be', false, be => {
					blur = be;
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

				checkMultipleOverrides(['pos', 'an', 'org'], [true, false, true], (pos, an='5', org) => {
					if (pos) {
						const [x, y] = pos;
						//positioning applies to the line, and if we just put it on this span it might get put in the right space, but the
						//containing paragraph elements will stack, possibly overlapping the video controls if
						containerInline.push(`position: fixed; left: ${this.scaleWidth(x)}; top: ${this.scaleHeight(y)}`);

						//CSS positioning moves as if it's \an7
						//but by .ass positionings seem to work like \an5,
						//so we need to first reconcile the difference in movement by adding
						//an extra -50%, -50%, so that's why these numbers look weird, without
						//that adjustment all positioned subtitles are too far down and right
						const origin = {
							'1': '50%, -150%',
							'2': '-50%, -150%',
							'3': '-150%, -150%',
							'4': '50%, -50%',
							'5': '-50%, -50%',
							'6': '-150%, -50%',
							'7': '50%, 50%',
							'8': '-50%, 50%',
							'9': '-150%, 50%'
						}[an];
						containerInline.push(`transform: translate(${origin})`);

						if (org) {
							const [orgX, orgY] = org;
							cumulativeStyles.push(`transform-origin: ${this.scaleWidth(orgX)} ${this.scaleHeight(orgY)}`);
						}
					}
					else if (an) {

					}
				});

				checkMultipleOverrides(['frx', 'fry', 'frz'], false, (xRot, yRot, zRot) => {
					const rotations = [];
					const checkRotate = (deg, axies, multiplier=1) => {
						if (deg !== undefined) {
							deg = parseFloat(deg) * multiplier;
							return rotations.push(`rotate3d(${axies.join(', ')}, ${deg}deg)`);
						}
					};

					//the direction of rotation seems to be different for the y/z axis compared to css transforms
					checkRotate(xRot, [1, 0, 0]);
					checkRotate(zRot, [0, 0, 1], -1);
					checkRotate(yRot, [0, 1, 0]);

					if (rotations.length) {
						containerInline.push(`perspective: 200px`);
						//can't rotate while it's display: inline;
						cumulativeStyles.push(`display: block; transform: ${rotations.join(' ')}`);
					}
				});


				checkOverride('fad', true, ([fadeIn, fadeOut]) => {
					styled.fadeIn = parseInt(fadeIn, 10);
					styled.fadeOut = parseInt(fadeOut, 10);
					//svelte will not start animating until the sub is done showing and not before,
					//so we need to subtract the amount of fadeout time from the subtitle's end time so it works
					sub.end -= fadeOut;
				});

				checkOverride('fsp', false, spacing => {
					cumulativeStyles.push(`letter-spacing: ${spacing}px`)
				});

				checkOverride('fs', false, fontSize => {
					cumulativeStyles.push(this.genScaledFont(fontSize));
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
					cumulativeStyles.push(genFontFamily(fn));
				});

				//colors
				checkOverride('1c', false, color => {
					cumulativeStyles.push(`color: ${parseColor(color)}`)
				});

				checkOverride('r', false, style => {
					if (style) {
						const srcStyle = this.styles[style];
						cumulativeStyles = [srcStyle.inline];
					}
					//if we're not switching to another style, just blank out the styles
					else {
						cumulativeStyles = [];
					}
				});


				styled.inline = cumulativeStyles.join(';');
				sub.phrases.push(styled);
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
