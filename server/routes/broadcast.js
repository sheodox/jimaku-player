const imageStore = require('../db/imagestore'),
	fs = require('fs'),
	path = require('path'),
	child_process = require('child_process'),
	{promisify} = require('util'),
	readFile = promisify(fs.readFile),
	readdir = promisify(fs.readdir),
	exec = promisify(child_process.exec),
	router = require('express').Router(),
	source = 'broadcast';

router.get('/video-list', async (req, res) => {
	const videoPaths = await scanVideos(),
		videos = [];

	for (const videoPath of videoPaths) {
		videos.push({
			src: videoPath,
			text: path.basename(videoPath, path.extname(videoPath)),
			imageKey: await imageStore.getIdFromSourceKey(source, videoPath)
		})
	}
	res.json(videos);
});

function scanVideos() {
	return readdir('./videos');
}

async function generateMissingImages() {
	const imageGeneratePath = './data/temp/broadcast-generated.png',
		videoPaths = await scanVideos(),
		videosWithoutImages = await imageStore.findMissingImages(source, videoPaths);

	if (!videosWithoutImages.length) {
		return;
	}

	for (const video of videosWithoutImages) {
		await exec(`ffmpeg -i ${path.join('./videos', video)} -ss 00:00:01.000 -vframes 1 ${imageGeneratePath} -y`);
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