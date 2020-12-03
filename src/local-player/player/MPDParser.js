import {Logger} from '../logger';
import {prettyTime} from "../utils";

export const MINIMUM_BUFFER_INTERVAL = 10; //buffer this number of seconds worth of segments

function parseByteRange(byteRange) {
	const [from, to] = byteRange.split('-').map(bytes => parseInt(bytes, 10));

	//range is the byte range as-is, used in the range header to fetch this segment
	return {from, to, range: byteRange};
}

// 'sNode' is literally an <S> element
function parseTimelineSegment(sNode) {
	//segments in the timeline are 'S' nodes that have a 'd' attribute (duration in ms),
	//maybe a 't', (start in ms), and maybe an 'r' (how many additional duplicates of this S follow)
	const start = sNode.getAttribute('s'),
		repeat = sNode.getAttribute('r'),
		times = {
			duration: parseInt(sNode.getAttribute('d'), 10),
			repetitions: 1 + (repeat ? parseInt(repeat, 10) : 0)
		}
	if (start) {
		times.start = parseInt(start, 10);
	}
	return times;
}

export class MPDParser {
	constructor(mpdText) {
		const domParser = new DOMParser();
		this._generateIdBase = 0;
		this.mpdXml = domParser.parseFromString(mpdText, 'text/xml');
		this.logger = new Logger(`MPDParser`);

		//this could be an AdaptationSet node or a Representation node, depending on the MPD
		const videoAdaptation = this.mpdXml.querySelector(`Representation[mimeType^=video]`).parentNode,
			audioRepresentations = this.mpdXml.querySelectorAll('Representation[mimeType^=audio]');

		this.video = this.parseAdaptation(videoAdaptation);
		this.logger.streaming('Parsed video data', this.video);

		const lastSegmentEnd = this.video.segments[this.video.segments.length - 1].timing.toPretty;
		this.logger.streaming(`Parsed ${this.video.segments.length} video segments over a total of ${lastSegmentEnd}.`);

		this.audio = [];
		for (const rep of audioRepresentations) {
			const audioData = this.parseAdaptation(rep.parentNode);
			this.audio.push(audioData);
			this.logger.streaming('Parsed audio data', audioData);
		}
	}
	parseAdaptation(adaptation) {
		const representation = adaptation.querySelector('Representation'),
			bitrate = parseInt(representation.getAttribute('bandwidth'), 10);
		return {
			...this.parseSegments(adaptation, bitrate),
			mimeType: representation.getAttribute('mimeType'),
			codecs: representation.getAttribute('codecs'),
		};
	}
	parseSegments(adaptation, bitrate) {
		const initialization = adaptation.querySelector('Initialization').getAttribute('range'),
			segmentNodes = adaptation.querySelectorAll('SegmentURL'),
			timeline = this.parseSegmentTimeline(adaptation);

		const segments = [];
		let start = 0;
		for (let i = 0; i < segmentNodes.length; i++) {
			const node = segmentNodes[i],
				mediaRange = parseByteRange(node.getAttribute('mediaRange')),
				duration = ((mediaRange.to - mediaRange.from) * 8) / bitrate;

			segments.push({
				id: this._generateIdBase++,
				mediaRange,
				segmentNumber: i,
				timing: timeline[i]
			});
			start += duration;
		}
		return {
			segments,
			initialization
		};
	}
	parseSegmentTimeline(adaptation) {
		const segmentNodes = adaptation.querySelectorAll('SegmentTimeline S'),
			timescale = parseInt(adaptation.querySelector('SegmentList').getAttribute('timescale'), 10),
			timeline = [];
		let start = 0;

		for (const segmentNode of segmentNodes) {
			const segmentDetails = parseTimelineSegment(segmentNode);
			if (segmentDetails.start) {
				start = segmentDetails.start;
			}
			for (let i = 0; i < segmentDetails.repetitions; i++) {
				const from = start / timescale,
					to = (start + segmentDetails.duration) / timescale
				timeline.push({
					from,
					to,
					duration: segmentDetails.duration / timescale,
					fromPretty: prettyTime(from),
					toPretty: prettyTime(to)
				});
				start += segmentDetails.duration;
			}
		}
		return timeline;
	}
	findSegmentIndexByTime(segments, seconds) {
		return segments.findIndex(segment => {
			return segment.timing.from <= seconds && segment.timing.to > seconds;
		})
	}
	getSegmentsForMinimumBufferedInterval(segments, startIndex) {
		let duration = 0;
		let i = startIndex;
		for (; i < segments.length && duration < MINIMUM_BUFFER_INTERVAL; i++) {
			duration += segments[i].timing.duration;
		}
		return i;
	}
	getSegmentsToBuffer(seconds, audioTrackIndex) {
		const videoSegmentIndex = this.findSegmentIndexByTime(this.video.segments, seconds),
			prettySeconds = prettyTime(seconds);
		if (videoSegmentIndex === -1) {
			this.logger.error(`No segments found for ${prettySeconds}!`)
			return;
		}

		const videoStartSegmentIndex = Math.max(0, videoSegmentIndex - 1),
			//make sure to fetch at least 10 seconds of video after the current
			videoEndSegmentIndex = Math.min(this.video.segments.length - 1, this.getSegmentsForMinimumBufferedInterval(this.video.segments, videoSegmentIndex + 1));

		this.logger.streaming(
			`For video time ${prettyTime(seconds)} (segment index ${videoSegmentIndex}), ${videoEndSegmentIndex - videoStartSegmentIndex} segments should be buffered from ${this.video.segments[videoStartSegmentIndex].timing.fromPretty} to ${this.video.segments[videoEndSegmentIndex].timing.toPretty} (segment indices ${videoStartSegmentIndex} to ${videoEndSegmentIndex}).`
		)

		return {
			videoSegments: this.video.segments.slice(
				videoStartSegmentIndex,
				videoEndSegmentIndex + 1
			),
			audioSegments: this.audio[audioTrackIndex].segments.slice(
				videoStartSegmentIndex,
				videoEndSegmentIndex + 1
			)
		};
	}
}