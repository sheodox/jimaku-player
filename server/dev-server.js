const express = require('express'),
	app = express(),
	fs = require('fs'),
	port = 3500;

//ensure the path for videos exists
['./videos', './data', './data/temp'].forEach(dir => {
	try {
		fs.mkdirSync(dir);
	} catch(e) {}
});

app.use(express.static('./static'));
app.use(express.static('./videos'));

app.use(require('./routes/images'));
app.use(require('./routes/broadcast'));

app.listen(port, () => console.log(`dev server listening on port ${port}`));

