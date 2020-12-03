import {MPDParser} from "./MPDParser";
import {Logger} from "../logger";
import {isTimeBuffered, prettyTime} from "../utils";

//clean up buffered memory beyond a certain range. if we load too much
//this might remove some of it and need to be re-buffered, but the
//browser can only handle so much and without trying to purge some it might
//just fail to append new buffers- Firefox seems to do th at with audio
const MAX_BUFFER_BEFORE = 20,
	MAX_BUFFER_AFTER = 50;

function fetchRange(url, range) {
	return fetch(url, {
		headers: {
			'Range': `bytes=${range}`
		}
	}).then(res => res.arrayBuffer());
}

function getSourceBufferType(parsedAdaptation) {
	return `${parsedAdaptation.mimeType};codecs=${parsedAdaptation.codecs}`;
}

function eventPromise(target, event) {
	return new Promise(resolve => target.addEventListener(event, resolve, {once: true}));
}

export class Streamer {
	constructor(metadata, resourceBase) {
		this.metadata = metadata; // jimaku ingest metadata JSON file
		this.videoSrc = resourceBase + '/' + metadata.video; // a URL for the video in question
		//TODO remove this. this needs to be defined in the manifest
		this.audioSrc = this.videoSrc.replace('track1', 'track2');
		this.resourceBase = resourceBase;
		this.logger = new Logger('Streamer');
		this.mpd = new MPDParser(metadata.mpd);
		this.source = new MediaSource();
		this.src = URL.createObjectURL(this.source);
		this.audioTrackIndex = 0;

		this.ready = this.init();
		this.videoSegmentUpdatePromise = this.ready;
		this.audioSegmentUpdatePromise = this.ready;
	}
	async init() {
		await eventPromise(this.source, 'sourceopen');
		const videoType = getSourceBufferType(this.mpd.video),
			audioType = getSourceBufferType(this.mpd.audio[this.audioTrackIndex]);
		[videoType, audioType].forEach(type => {
			if (!MediaSource.isTypeSupported(type)) {
				this.logger.error(`Media type "${type}" isn't supported by your browser`);
			}
		})
		this.logger.streaming(`Video type ${videoType}, audio type ${audioType}`)
		this.videoBuffer = this.source.addSourceBuffer(videoType);
		this.audioBuffer = this.source.addSourceBuffer(audioType);
		this.videoBuffer.mode = 'segments';
		this.audioBuffer.mode = 'segments';

		this.videoBuffer.addEventListener('error', () => this.logger.error(`Video buffer error! (check videoElement.error)`));
		this.audioBuffer.addEventListener('error', () => this.logger.error(`Audio buffer error! (check videoElement.error)`));

		const videoInit = await fetchRange(this.videoSrc, this.mpd.video.initialization),
			audioInit = await fetchRange(this.audioSrc, this.mpd.audio[this.audioTrackIndex].initialization)
		this.logger.streaming('Fetched video and audio initialization buffers');

		//need to initialize the video before any segments can be parsed. this can't use
		//the updateVideoBuffer/updateAudioBuffer methods, as they wait for this method
		//to complete so we'd just never initialize the buffers
		this.videoBuffer.appendBuffer(videoInit);
		await eventPromise(this.videoBuffer, 'updateend');
		this.audioBuffer.appendBuffer(audioInit);
		await eventPromise(this.audioBuffer, 'updateend');

		this.logger.streaming('Streamer initialized');
	}

	/**
	 * We want to avoid trying to buffer something we've already buffered before, but we can't just cache
	 * all segments we've tried buffering in the past because browsers will eventually evict buffered
	 * video segments from memory- in which case we'd need to request them again.
	 * @param buffer - this.videoBuffer or this.audioBuffer
	 * @param segment
	 * @returns {boolean}
	 */
	isSegmentBuffered(buffer, segment) {
		if (!buffer) {
			return false;
		}

		//check the midpoint of the segment, maybe not necessary but be sure we're absolutely checking for this segment only
		const seconds = (segment.timing.to + segment.timing.from) / 2;

		return isTimeBuffered(seconds, buffer.buffered);
	}

	/**
	 * This and updateAudioBuffer are methods that allow you to perform some update (appendBuffer or remove) to
	 * either of the buffers safely. Only one operation can be done on a buffer at once, trying to do more than
	 * one will throw errors and we will fail to buffer something. Using these functions will wait for the update
	 * to finish before resolving.
	 * @param bufferUpdateFn
	 * @returns {Promise<void>}
	 */
	async updateVideoBuffer(bufferUpdateFn) {
		this.videoSegmentUpdatePromise = this.videoSegmentUpdatePromise
			.then(async () => {
				await bufferUpdateFn();
				await eventPromise(this.videoBuffer, 'updateend');
			});
		await this.videoSegmentUpdatePromise;
	}
	async updateAudioBuffer(bufferUpdateFn) {
		this.audioSegmentUpdatePromise = this.audioSegmentUpdatePromise
			.then(async () => {
				await bufferUpdateFn();
				await eventPromise(this.audioBuffer, 'updateend');
			});
		await this.audioSegmentUpdatePromise;
	}
	async fetchSegment(seconds) {
		await this.ready;

		const segments = this.mpd.getSegmentsToBuffer(seconds, this.audioTrackIndex),
			bufferingSegments = [];

		//ensure something's buffered in the first place before trying to purge old buffers.
		//browsers don't seem to like removing some of nothing.
		if (this.videoBuffer.buffered.length) {
			//purge video and audio buffers beyond some time ranges around the current time
			//we're trying to buffer.
			if (seconds > MAX_BUFFER_BEFORE) {
				const earliestBufferTime = seconds - MAX_BUFFER_BEFORE;
				this.logger.streaming(`Purging buffer before ${prettyTime(earliestBufferTime)}`)
				//if we're further into the video than the max allowed before the current time, remove
				//everything up to that. this allows the user to rewind a bit without having to buffer again
				await this.updateVideoBuffer(() => {
					this.videoBuffer.remove(0, earliestBufferTime);
				});
				await this.updateAudioBuffer(() => {
					this.audioBuffer.remove(0, earliestBufferTime);
				});
			}
			if (this.source.duration - seconds > MAX_BUFFER_AFTER) {
				//if the video has more time left than the max we want to keep buffered, remove
				//anything beyond that. this happens if the user seeks back in the video
				const latestBufferTime = seconds + MAX_BUFFER_AFTER;
				this.logger.streaming(`Purging buffer after ${prettyTime(latestBufferTime)}`)
				await this.updateVideoBuffer(() => {
					this.videoBuffer.remove(latestBufferTime, this.source.duration);
				});
				await this.updateAudioBuffer(() => {
					this.audioBuffer.remove(latestBufferTime, this.source.duration);
				});
			}
		}

		/*
		The promise stuff here is kind of weird looking at first, but it's on purpose.
		We want to fetch segments in parallel so we don't await the fetches, but we want
		this method to resolve when all segments requested have been loaded, so we only await
		the promise from all the segments have been added to the source buffer.
		 */
		for (const segment of segments.videoSegments) {
			if (segment && !this.isSegmentBuffered(this.videoBuffer, segment)) {
				bufferingSegments.push(fetchRange(this.videoSrc, segment.mediaRange.range)
					.then(async buffer => {
						await this.updateVideoBuffer(() => {
							this.videoBuffer.appendBuffer(buffer);
						});
						this.logger.streaming(`Buffered video segment ${segment.segmentNumber} for ${segment.timing.fromPretty} to ${segment.timing.toPretty} (for ${prettyTime(seconds)})`);
					}));
			}
		}

		for (const segment of segments.audioSegments) {
			if (segment && !this.isSegmentBuffered(this.audioBuffer, segment)) {
				bufferingSegments.push(fetchRange(this.audioSrc, segment.mediaRange.range)
					.then(async buffer => {
						await this.updateAudioBuffer(() => {
							this.audioBuffer.appendBuffer(buffer);
						})
						this.logger.streaming(`Buffered audio segment ${segment.segmentNumber} for ${segment.timing.fromPretty} to ${segment.timing.toPretty} (for ${prettyTime(seconds)})`);
					}));
			}
		}
		return Promise.all(bufferingSegments);
	}
}