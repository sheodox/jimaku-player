require('dotenv').config();
import "reflect-metadata";
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express(),
	port = 3500;

//ensure the path for videos exists
['./videos', './data', './data/temp'].forEach(dir => {
	try {
		fs.mkdirSync(dir);
	} catch(e) {}
});

app.use(express.static('./static'));
app.use('/test', express.static('./src/test'));
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'));
app.use('/videos', express.static('./videos'));

app.use(require('./routes/images'));
app.use(require('./routes/broadcast'));

app.get('/v/*', (req, res) => {
	res.sendFile(path.join(__dirname, '../static/index.html'));
});
app.listen(port, () => console.log(`Jimaku Player server listening on port ${port}`));

