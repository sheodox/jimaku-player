const imageStore = require('../db/imagestore'),
	fs = require('fs'),
	path = require('path'),
	child_process = require('child_process'),
	{promisify} = require('util'),
	readFile = promisify(fs.readFile),
	readdir = promisify(fs.readdir),
	glob = promisify(require('glob')),
	exec = promisify(child_process.exec),
	router = require('express').Router(),
	source = 'broadcast';

router.get('/video-list', async (req, res) => {
	const videoPaths = await scanVideos(),
		videos = [];

	for (const videoPath of videoPaths) {
		videos.push(await getVideoInfo(videoPath));
	}

	res.json(groupByFolder(videos));
});

router.get('/video-info', async (req, res) => {
	res.json(await getVideoInfo(req.query.path));
});

async function getVideoInfo(videoPath) {
	return {
		type: 'video',
		src: videoPath.replace('./', ''),
		text: path.basename(videoPath, path.extname(videoPath)),
		imageKey: await imageStore.getIdFromSourceKey(source, videoPath)
	}
}

function scanVideos() {
	return glob('./videos/**/*.mp4');
}

function groupByFolder(videos) {
	const grouped = [],
		findGroup = (groups, paths) => {
			//if there are no more paths to process, we're done
			if (paths.length === 1) {
				return groups;
			}
			else {
				const [thisPath, ...nextPaths] = paths;

				let nextGroup = groups.find(g => g.path === thisPath);
				if (!nextGroup) {
					nextGroup = {
						path: thisPath,
						type: 'directory',
						children: []
					};
					groups.push(nextGroup);
				}

				return findGroup(nextGroup.children, nextPaths);
			}
		};

	videos.forEach(video => {
		//slice(1) removes 'videos' from the path, it's not important because everything is in there
		findGroup(grouped, video.src.split(path.sep).slice(1))
			.push(video);
	});
	return grouped;
}

async function generateMissingImages() {
	const imageGeneratePath = './data/temp/broadcast-generated.png',
		videoPaths = await scanVideos(),
		videosWithoutImages = await imageStore.findMissingImages(source, videoPaths);

	if (!videosWithoutImages.length) {
		return;
	}
	console.log(`Videos - generating ${videosWithoutImages.length} images`);

	for (const video of videosWithoutImages) {
		await exec(`ffmpeg -ss 00:05:00.000 -i "${video}" -vframes 1 ${imageGeneratePath} -y`);
		const image = await readFile(imageGeneratePath);
		await imageStore.generate({
			image,
			source,
			image_type: 'image/png',
			source_key: video
		})
	}
	console.log(`Videos - done generating images for ${videosWithoutImages.length} videos`)
}


imageStore.onReady(async () => {
	await generateMissingImages();

	setInterval(generateMissingImages, 5 * 60 * 1000);
});
module.exports = router;