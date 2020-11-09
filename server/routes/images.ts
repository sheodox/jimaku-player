import {ImageService, ImageSize} from "../ImageService";
import {Router} from 'express';
const router = Router();

router.get('/image/:size/:id', async (req, res) => {
	const {size, id} = req.params;
	const imageData = await ImageService.getImageById(size as ImageSize, parseInt(id, 10));
	if (!imageData) {
		res.status(404);
		return res.send(null);
	}

	res.header('Content-Type', 'image/webp');
	res.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 7}`); //one week
	res.send(imageData);
});

module.exports = router;
