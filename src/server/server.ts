import express from 'express';
import path from 'path';
import { router as broadcastRouter } from './routes/broadcast.js';

const app = express(),
	port = 3500;

app.use(express.static('./build/static'));
app.use('/test', express.static('./src/test'));
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'));
app.use('/videos', express.static('./videos'));

app.use(broadcastRouter);

app.set('views', path.resolve('src/server/views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
	res.redirect('/v/');
});
app.get('/v/*', (req, res) => {
	res.render('index', {
		development: process.env.NODE_ENV === 'development',
	});
});
app.get('/video', (req, res) => {
	res.render('video', {
		development: process.env.NODE_ENV === 'development',
	});
});

app.listen(port, () => console.log(`Jimaku Player server listening on port ${port}`));
