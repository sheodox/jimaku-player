import { Logger } from '../logger';
import { prettyTime } from '../utils';

export const MINIMUM_BUFFER_INTERVAL = 10; //buffer this number of seconds worth of segments

function parseByteRange(byteRange: string) {
	const [from, to] = byteRange.split('-').map((bytes) => parseInt(bytes, 10));

	//range is the byte range as-is, used in the range header to fetch this segment
	return { from, to, range: byteRange };
}

// 'sNode' is literally an <S> element
function parseTimelineSegmentNode(sNode: Element) {
	//segments in the timeline are 'S' nodes that have a 'd' attribute (duration in ms),
	//maybe a 't', (start in ms), and maybe an 'r' (how many additional duplicates of this S follow)
	const start = sNode.getAttribute('s'),
		repeat = sNode.getAttribute('r'),
		times = {
			duration: parseInt(sNode.getAttribute('d'), 10),
			repetitions: 1 + (repeat ? parseInt(repeat, 10) : 0),
			start: start ? parseInt(start, 10) : null,
		};
	return times;
}

export interface Segment {
	id: number;
	segmentNumber: number;
	mediaRange: {
		// these are byte numbers, how many bytes into the file this content is,
		// not to be confused with the from/to timing numbers in 'timing'
		from: number;
		to: number;
		range: string;
	};
	timing: {
		from: number;
		to: number;
		duration: number;
		fromPretty: ReturnType<typeof prettyTime>;
		toPretty: ReturnType<typeof prettyTime>;
	};
}

export class MPDParser {
	_generateIdBase: number;
	logger: Logger;
	mpdXml: XMLDocument;
	mimeType: string;
	codecs: string;
	// the byte range needed to initialize the stream
	initialization: string;
	segments: Segment[];

	constructor(mpdText: string, streamDescription: string) {
		const domParser = new DOMParser();
		this._generateIdBase = 0;
		this.mpdXml = domParser.parseFromString(mpdText, 'text/xml');
		this.logger = new Logger(`MPDParser-${streamDescription}`);

		const adaptation = this.mpdXml.querySelector(`AdaptationSet`);

		this.parseAdaptation(adaptation);
		this.logger.streaming('Parsed MPD data', this);

		const lastSegmentEnd = this.segments[this.segments.length - 1].timing.toPretty;
		this.logger.streaming(`Parsed ${this.segments.length} video segments over a total of ${lastSegmentEnd}.`);
	}
	parseAdaptation(adaptation: Element) {
		const representation = adaptation.querySelector('Representation');

		this.parseSegments(adaptation);
		this.mimeType = representation.getAttribute('mimeType');
		this.codecs = representation.getAttribute('codecs');
	}
	parseSegments(adaptation: Element) {
		const initialization = adaptation.querySelector('Initialization').getAttribute('range'),
			segmentNodes = adaptation.querySelectorAll('SegmentURL'),
			timeline = this.parseSegmentTimeline(adaptation);

		const segments = [];
		for (let i = 0; i < segmentNodes.length; i++) {
			const node = segmentNodes[i],
				mediaRange = parseByteRange(node.getAttribute('mediaRange'));

			segments.push({
				id: this._generateIdBase++,
				mediaRange,
				segmentNumber: i,
				timing: timeline[i],
			});
		}

		this.segments = segments;
		this.initialization = initialization;
	}
	parseSegmentTimeline(adaptation: Element) {
		const segmentNodes = adaptation.querySelectorAll('SegmentTimeline S'),
			timescale = parseInt(adaptation.querySelector('SegmentList').getAttribute('timescale'), 10),
			timeline = [];
		let start = 0;

		for (const segmentNode of segmentNodes) {
			const segmentDetails = parseTimelineSegmentNode(segmentNode);
			if (segmentDetails.start) {
				start = segmentDetails.start;
			}
			for (let i = 0; i < segmentDetails.repetitions; i++) {
				const from = start / timescale,
					to = (start + segmentDetails.duration) / timescale;
				timeline.push({
					from,
					to,
					duration: segmentDetails.duration / timescale,
					fromPretty: prettyTime(from),
					toPretty: prettyTime(to),
				});
				start += segmentDetails.duration;
			}
		}
		return timeline;
	}
	findSegmentIndexByTime(segments: Segment[], seconds: number) {
		return segments.findIndex((segment) => {
			return segment.timing.from <= seconds && segment.timing.to > seconds;
		});
	}
	getSegmentsForMinimumBufferedInterval(segments: Segment[], startIndex: number) {
		let duration = 0;
		let i = startIndex;
		for (; i < segments.length && duration < MINIMUM_BUFFER_INTERVAL; i++) {
			duration += segments[i].timing.duration;
		}
		return i;
	}
	getSegmentsToBuffer(seconds: number) {
		const videoSegmentIndex = this.findSegmentIndexByTime(this.segments, seconds),
			prettySeconds = prettyTime(seconds);
		if (videoSegmentIndex === -1) {
			this.logger.error(`No segments found for ${prettySeconds}!`);
			return;
		}

		const videoStartSegmentIndex = Math.max(0, videoSegmentIndex - 1),
			//make sure to fetch at least 10 seconds of video after the current
			videoEndSegmentIndex = Math.min(
				this.segments.length - 1,
				this.getSegmentsForMinimumBufferedInterval(this.segments, videoSegmentIndex + 1)
			);

		this.logger.streaming(
			`For stream time ${prettyTime(seconds)} (segment index ${videoSegmentIndex}), ${
				videoEndSegmentIndex - videoStartSegmentIndex
			} segments should be buffered from ${this.segments[videoStartSegmentIndex].timing.fromPretty} to ${
				this.segments[videoEndSegmentIndex].timing.toPretty
			} (segment indices ${videoStartSegmentIndex} to ${videoEndSegmentIndex}).`
		);

		return this.segments.slice(videoStartSegmentIndex, videoEndSegmentIndex + 1);
	}
}
