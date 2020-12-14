import {ImageService} from "../ImageService";
import path from 'path';
import child_process from 'child_process';
import {promisify} from "util";
import {Router} from 'express';
import {imageRepository} from "../entity";
import {
	deMetaPaths,
	countVideosInPath,
	scanVideoDirectories,
	scanVideos,
	countDirectoriesInPath
} from "../video-scanner";
const fs = require('fs').promises,
	glob = promisify(require('glob')),
	exec = promisify(child_process.exec),
	router = Router();

// metadata about a video or a directory
interface VideoMetadata {
	type: 'video'
	src: string
	name: string
	imageKey: number
}

interface DirectoryMetadata {
	type: 'directory'
	src: string
	name: string,
	containedVideos: number
	containedDirectories: number
}

interface VideoInfo {
    metadata?: MetadataFile,
	selectedVideo?: VideoMetadata
	directories?: DirectoryMetadata[]
	videos?: VideoMetadata[]
	history?: DirectoryMetadata[]
}

interface MetadataFile {
	name: string,
	video: string,
	audio: {
		language: string,
		title?: string,
		fileName: string
	}[],
	subtitles: {
		format: string,
		language: string,
		title: string,
		content: string
	}[]
}

router.get('/video-info', async (req, res) => {
	const videoPath = (req.query.path as string),
		videos = scanVideos(),
		videoDirs = scanVideoDirectories(),
		// make sure the video requested is actually a path of a real video or directory
		isValidVideo = videos.includes(`./${videoPath}`),
		isValidVideoFolder = videoDirs.includes(`./${videoPath}`),
		response: VideoInfo = {};

	if (!isValidVideo && !isValidVideoFolder) {
		res.status(404);
		res.json({
			error: 'invalid path specified'
		});
		return;
	}

	let focusedPath;
	if (isValidVideo) {
		const videoDir = path.dirname(videoPath);
		response.selectedVideo = await getVideoInfo(videoPath);
		response.metadata = await getMetadataFile(videoPath);
		focusedPath = videoDir;
	}
	else if (isValidVideoFolder) {
		focusedPath = videoPath;
	}
	const pathToDirectoryObject = (dirPath: string): DirectoryMetadata => {
		//find the last non-empty part of the path when split on path separators, that's the name of the deepest
		//directory this path represents
		const deepestDirName = dirPath.split(path.sep).reduce((lastPath, nextPath) => {
			return nextPath ? nextPath : lastPath;
		});
		return {
			type: 'directory',
			src: /\/$/.test(dirPath) ? dirPath : dirPath + '/',
			name: deepestDirName,
			containedVideos: countVideosInPath(dirPath),
			containedDirectories: countDirectoriesInPath(dirPath)
		}
	};
	response.directories = (await getDirectoriesInPath(focusedPath)).map(pathToDirectoryObject);

	const videosInPath = await getVideosAtPath(focusedPath);
	response.videos = [];
	for (const vpath of videosInPath) {
		response.videos.push(await getVideoInfo(vpath));
	}

	response.history = [];
	const pathSegmentsToVideo = focusedPath.replace(/^\.\//, '').split(path.sep);
	let cumulativePath = '';
	pathSegmentsToVideo.forEach((segment, index) => {
		//split will leave us with an empty string at the end of the path segments, because it'll end with a slash
		if (segment) {
			cumulativePath = path.join(cumulativePath, segment);
			const prettySegment = pathToDirectoryObject(cumulativePath);
			//override the base 'videos' folder name
			if (index === 0) {
				prettySegment.name = 'All Videos'
			}
			response.history.push(prettySegment);
		}
	});

	res.json(response);
});

/**
 * Get videos within the selected folder.
 * @param dirPath
 */
async function getVideosAtPath(dirPath: string) {
	return deMetaPaths(await glob(path.join('./', dirPath, '/*-metadata.json')));
}

async function getMetadataFile(videoSlug: string) {
	return JSON.parse((await fs.readFile(videoSlug + '-metadata.json')).toString());
}

/**
 * Get directories within the selected path.
 * @param dirPath
 */
async function getDirectoriesInPath(dirPath: string) {
	return glob(path.join('./', dirPath, '*/'));
}

/**
 * Get some metadata about the video in question
 * @param videoPath
 */
async function getVideoInfo(videoPath: string): Promise<VideoMetadata> {
	videoPath = (videoPath.indexOf('./') === 0 ? '' : './') + videoPath;
	return {
		type: 'video',
		src: videoPath.replace('./', ''),
		name: path.basename(videoPath, path.extname(videoPath)),
		imageKey: await ImageService.findId(videoPath)
	}
}


async function generateMissingImages() {
	const imageGeneratePath = './data/temp/broadcast-generated.png',
		videoPaths = scanVideos(),
		videosWithoutImages = await ImageService.findMissingImages(videoPaths);

	if (!videosWithoutImages.length) {
		return;
	}
	console.log(`Videos - generating ${videosWithoutImages.length} images`);

	for (const videoBase of videosWithoutImages) {
		const metadata: MetadataFile = JSON.parse((await fs.readFile(`${videoBase}-metadata.json`)).toString()),
			videoPath = path.join(path.dirname(videoBase), metadata.video);

		// extract one frame of video to the temp image path
		await exec(`ffmpeg -ss 00:05:00.000 -i "${videoPath}" -vframes 1 ${imageGeneratePath} -y`);

		await ImageService.generate(
			await fs.readFile(imageGeneratePath),
			videoBase
		);
	}
	console.log(`Videos - done generating images for ${videosWithoutImages.length} videos`)
}


imageRepository.then(async () => {
	await generateMissingImages();

	setInterval(generateMissingImages, 5 * 60 * 1000);
});
module.exports = router;