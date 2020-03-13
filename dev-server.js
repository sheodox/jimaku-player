const express = require('express'),
	app = express(),
	fs = require('fs'),
	{promisify} = require('util'),
	readdir = promisify(fs.readdir),
	port = 3500;

//ensure the path for videos exists
try {
	fs.mkdirSync('./videos');
} catch(e) {}

app.use(express.static('./static'));
app.use(express.static('./videos'));

app.get('/video-list', async (req, res) => {
	const videos = await readdir('./videos');
	res.json(videos.map(v => {
		return {
			src: v,
			text: v
		}
	}));
});

app.listen(port, () => console.log(`dev server listening on port ${port}`));

