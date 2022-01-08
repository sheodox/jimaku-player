import path from 'path';
import fs from 'fs';
import { Router } from 'express';
import { videoScanner } from '../video-scanner.js';
import type { DirectoryMetadata, VideoInfo } from '../../shared/types/videos.js';
import { thumbnails, ThumbnailSize } from '../thumbnails.js';

export const router = Router();

const pathToDirectoryObject = (dirPath: string): DirectoryMetadata => {
	//find the last non-empty part of the path when split on path separators, that's the name of the deepest
	//directory this path represents
	const deepestDirName = dirPath.split(path.sep).reduce((lastPath, nextPath) => {
		return nextPath ? nextPath : lastPath;
	});
	return {
		type: 'directory',
		path: /\/$/.test(dirPath) ? dirPath : dirPath + '/',
		name: deepestDirName,
		containedVideos: videoScanner.countVideosInPath(dirPath),
		containedDirectories: videoScanner.countDirectoriesInPath(dirPath),
	};
};

router.get('/video-info', async (req, res) => {
	const requestedPath = req.query.path as string,
		// make sure the video requested is actually a path of a real video or directory
		isValidVideo = videoScanner.isVideoPath(requestedPath),
		response: VideoInfo = {};

	let focusedPath;
	if (isValidVideo) {
		const videoDir = path.dirname(requestedPath);
		response.selectedVideo = videoScanner.getVideoByPath(requestedPath);

		// plain mp4 file videos won't have a metadata file
		if (response.selectedVideo.type === 'dash') {
			response.manifest = await getManifestFile(requestedPath);
		}
		focusedPath = videoDir;
	} else {
		focusedPath = requestedPath;
	}

	response.directories = videoScanner.getDirectoriesInPath(focusedPath).map(pathToDirectoryObject);
	response.videos = videoScanner.getVideosInPath(focusedPath);

	response.history = [];
	const pathSegmentsToVideo = focusedPath.replace(/^\.\//, '').split(path.sep);
	let cumulativePath = '';
	pathSegmentsToVideo.forEach((segment, index) => {
		//split will leave us with an empty string at the end of the path segments, because it'll end with a slash
		if (segment) {
			cumulativePath = './' + path.join(cumulativePath, segment);
			const prettySegment = pathToDirectoryObject(cumulativePath);
			//override the base 'videos' folder name
			if (index === 0) {
				prettySegment.name = 'All Videos';
			}
			response.history.push(prettySegment);
		}
	});

	res.json(response);
});

router.get('/thumbnails/:videoId/:size', async (req, res) => {
	const { videoId, size } = req.params,
		thumbnailPath = await thumbnails.getThumbnailFilePath(videoId, size as ThumbnailSize);

	res.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 7}`); //one week
	fs.createReadStream(thumbnailPath).pipe(res);
});

async function getManifestFile(videoSlug: string) {
	return JSON.parse((await fs.promises.readFile(videoSlug + '-manifest.json')).toString());
}
