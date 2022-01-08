/*
When generating thumbnails instead of trying to mimic the directory structure of the video directory
it's easier to generate an ID for that video and generate thumbnails using that.

When the user views the site and requests the video listing for a folder, each video will get a
thumbnail ID generated here, and the front end will construct a URL using that ID and a thumbnail size.
*/

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import child_process from 'child_process';
import { promisify } from 'util';
import { videoScanner } from './video-scanner.js';
const exec = promisify(child_process.exec);

type Resolution = { width: number; height: number };

const //get a matching height at a 16:9 aspect ratio for the given width
	scaledResolution = (width: number): Resolution => ({ width, height: Math.ceil(width * (9 / 16)) }),
	MAX_RESOLUTION = {
		large: scaledResolution(1280),
		medium: scaledResolution(550),
		small: scaledResolution(120),
	},
	THUMBNAIL_PATH = './data/thumbnails';

export type ThumbnailSize = keyof typeof MAX_RESOLUTION;

class Thumbnails {
	private getThumbnailPath(videoId: string, size: ThumbnailSize) {
		return path.join(THUMBNAIL_PATH, `${videoId}-${size}.webp`);
	}

	private async exists(filePath: string) {
		try {
			await fs.promises.stat(filePath);
			return true;
		} catch (e) {
			return false;
		}
	}

	// get a path to an thumbnail, if it doesn't yet exist generate it
	async getThumbnailFilePath(videoId: string, size: ThumbnailSize) {
		const thumbnailPath = this.getThumbnailPath(videoId, size);

		if (await this.exists(thumbnailPath)) {
			return thumbnailPath;
		}

		await this.generate(videoId, size);

		return thumbnailPath;
	}

	private async generateStillFrame(videoPath: string) {
		const imageGeneratePath = './data/temp/thumbnail.png';

		// extract one frame of video to the temp image path
		// TODO: This should be more like 1/4 into the video dynamically instead of assuming every video is at least 5 minutes long
		await exec(`ffmpeg -ss 00:05:00.000 -i "${videoPath}" -vframes 1 ${imageGeneratePath} -y`);

		return await fs.promises.readFile(imageGeneratePath);
	}

	private async generate(videoId: string, size: ThumbnailSize) {
		const videoPath = videoScanner.getVideoById(videoId)._videoFilePath,
			thumbnailPath = this.getThumbnailPath(videoId, size),
			startTime = Date.now(),
			sourceImage = await this.generateStillFrame(videoPath),
			thumbnail = await sharp(sourceImage)
				.resize({ ...MAX_RESOLUTION[size], fit: 'inside' })
				.toFormat('webp')
				.toBuffer();

		console.log(`thumbnails: generated ${size} thumbnail for ${videoPath} in ${Date.now() - startTime} milliseconds`);
		await fs.promises.writeFile(thumbnailPath, thumbnail);
	}
}

export const thumbnails = new Thumbnails();
