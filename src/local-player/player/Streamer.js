import {MPDParser} from "./MPDParser";
import {Logger} from "../logger";
import {isEnoughBuffered, isTimeBuffered, prettyTime} from "../utils";
import settings from "../settings";

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
		this.videoSrc = resourceBase + '/' + metadata.video.fileName; // a URL for the video in question
		this.logger = new Logger('Streamer');
		this.videoTrack = new MPDParser(metadata.video.mpd, 'video');
		this.audioTracks = metadata.audio.map((audioTrack, index) => {
			return {
				src: resourceBase + '/' + audioTrack.fileName,
				mpd: new MPDParser(audioTrack.mpd, `audio-${index}`),
				metadata: audioTrack
			}
		});

		const preferredLanguage = settings.get('preferred-audio-language'),
			preferredAudioTrack = this.audioTracks.find(track => track.metadata.language === preferredLanguage);
		this.selectedAudioTrack = preferredAudioTrack || this.audioTracks[0];
		this.source = new MediaSource();
		this.src = URL.createObjectURL(this.source);

		this.ready = this.init();
		this.videoSegmentUpdatePromise = this.ready;
		this.audioSegmentUpdatePromise = this.ready;
	}
	async init() {
		await eventPromise(this.source, 'sourceopen');
		const videoType = getSourceBufferType(this.videoTrack),
			audioType = getSourceBufferType(this.selectedAudioTrack.mpd);
		[videoType, audioType].forEach(type => {
			if (!MediaSource.isTypeSupported(type)) {
				throw new Error(`Media type "${type}" isn't supported by your browser`);
			}
		});
		this.logger.streaming(`Video type ${videoType}, audio type ${audioType}`)
		this.videoBuffer = this.source.addSourceBuffer(videoType);
		this.audioBuffer = this.source.addSourceBuffer(audioType);
		this.videoBuffer.mode = 'segments';
		this.audioBuffer.mode = 'segments';

		this.videoBuffer.addEventListener('error', () => this.logger.error(`Video buffer error! (check videoElement.error)`));
		this.audioBuffer.addEventListener('error', () => this.logger.error(`Audio buffer error! (check videoElement.error)`));

		const videoInit = await fetchRange(this.videoSrc, this.videoTrack.initialization),
			audioInit = await fetchRange(this.selectedAudioTrack.src, this.selectedAudioTrack.mpd.initialization)
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

	async switchAudioTrack(audioTrackIndex, currentTime) {
		this.logger.streaming(`Switched to audio track ${audioTrackIndex}`);
		this.selectedAudioTrack = this.audioTracks[audioTrackIndex];
		await this.updateAudioBuffer(() => {
			this.audioBuffer.remove(0, this.source.duration);
		})
		await this.bufferAudio(currentTime);
		settings.set('preferred-audio-language', this.selectedAudioTrack.metadata.language);
	}

	getSelectedAudioTrackIndex() {
		return this.audioTracks.findIndex(track => track === this.selectedAudioTrack);
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
	async purgeUnneededRanges(currentTime) {
		//ensure something's buffered in the first place before trying to purge old buffers.
		//browsers don't seem to like removing some of nothing. if we're fetching audio only
		//it means we're switching buffers and the buffer would have just been cleared already
		if (!this.videoBuffer.buffered.length) {
		    return;
		}

		//purge video and audio buffers beyond some time ranges around the current time
		//we're trying to buffer.
		if (currentTime > MAX_BUFFER_BEFORE) {
			const earliestBufferTime = currentTime - MAX_BUFFER_BEFORE;
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
		if (this.source.duration - currentTime > MAX_BUFFER_AFTER) {
			//if the video has more time left than the max we want to keep buffered, remove
			//anything beyond that. this happens if the user seeks back in the video
			const latestBufferTime = currentTime + MAX_BUFFER_AFTER;
			this.logger.streaming(`Purging buffer after ${prettyTime(latestBufferTime)}`)
			await this.updateVideoBuffer(() => {
				this.videoBuffer.remove(latestBufferTime, this.source.duration);
			});
			await this.updateAudioBuffer(() => {
				this.audioBuffer.remove(latestBufferTime, this.source.duration);
			});
		}
	}

	/**
	 * Buffer audio or video if needed.
	 * @param seconds
	 * @returns {Promise<T>} - true if anything was requested, false if the buffer was healthy and nothing needed to be requested
	 */
	async bufferTime(seconds) {
		await this.ready;
	    const bufferingVideo = isEnoughBuffered(seconds, this.videoBuffer.buffered) ? Promise.resolve(false) : this.bufferVideo(seconds),
			bufferingAudio = isEnoughBuffered(seconds, this.audioBuffer.buffered) ? Promise.resolve(false) : this.bufferAudio(seconds);

		return Promise.all([
			bufferingVideo,
			bufferingAudio
		]).then(bufferRequests => {
			return bufferRequests.some(buffer => buffer);
		})
	}
	async bufferVideo(seconds) {
		await this.ready;
		await this.purgeUnneededRanges(seconds);
		const videoSegments = this.videoTrack.getSegmentsToBuffer(seconds),
			bufferingSegments = [];

		/*
        The promise stuff here is kind of weird looking at first, but it's on purpose.
        We want to fetch segments in parallel so we don't await the fetches, but we want
        this method to resolve when all segments requested have been loaded, so we only await
        the promise from all the segments have been added to the source buffer.
         */
		for (const segment of videoSegments) {
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
		return Promise.all(bufferingSegments).then(() => true);
	}
	async bufferAudio(seconds) {
		await this.ready;
		await this.purgeUnneededRanges(seconds);
		const bufferingSegments = [],
			audioSegments = this.selectedAudioTrack.mpd.getSegmentsToBuffer(seconds);

		for (const segment of audioSegments) {
			if (segment && !this.isSegmentBuffered(this.audioBuffer, segment)) {
				bufferingSegments.push(fetchRange(this.selectedAudioTrack.src, segment.mediaRange.range)
					.then(async buffer => {
						await this.updateAudioBuffer(() => {
							this.audioBuffer.appendBuffer(buffer);
						})
						this.logger.streaming(`Buffered audio segment ${segment.segmentNumber} for ${segment.timing.fromPretty} to ${segment.timing.toPretty} (for ${prettyTime(seconds)})`);
					}));
			}
		}
		return Promise.all(bufferingSegments).then(() => true);
	}
}