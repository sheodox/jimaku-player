import {imageRepository} from './entity';
import sharp from 'sharp';
import {Image} from './entity/Image';

type Resolution = {width: number, height: number};

const //get a matching height at a 16:9 aspect ratio for the given width
	scaledResolution = (width: number): Resolution => ({width, height: Math.ceil(width * (9/16))}),
	MAX_RESOLUTION = {
		large: scaledResolution(1280),
		medium: scaledResolution(550),
		small: scaledResolution(120)
	};

export type ImageSize = keyof typeof MAX_RESOLUTION;

export class ImageService {
	/**
	 * Get an array of source IDs that are missing images, given a bunch of sourceIDs
	 * @param {string[]} videoPaths - array of video paths
	 * @returns {Promise<string[]>}
	 */
	static async findMissingImages(videoPaths: string[]) {
		const populatedIds = (await (await imageRepository).find({
			select: ["sourceId"]
		}))
			.map(({sourceId}) => sourceId);

		return videoPaths.filter(video => {
			return !populatedIds.includes(video);
		});
	}

	static async findId(videoPath: string) {
		const repo = await imageRepository,
			image = await repo.findOne({sourceId: videoPath});
		return image?.id;
	}

	/**
	 * Generate an image
	 * @param sourceImage
	 * @param videoPath
	 * @returns {Promise<{error: string}|{}>}
	 */
	static async generate(sourceImage: Buffer, videoPath: string) {
		const repo = await imageRepository,
			startTime = Date.now(),
			image = new Image();

		image.sourceId = videoPath;

		async function resize(toSize: keyof typeof MAX_RESOLUTION) {
			return await sharp(sourceImage)
				.resize({...MAX_RESOLUTION[toSize], fit: 'inside'})
				.toFormat('webp')
				.toBuffer();
		}

		image.large = await resize('large');
		image.medium = await resize('medium');
		image.small = await resize('small');

		console.log(`ImageStore: generated images for ${videoPath} in ${Date.now() - startTime} milliseconds`);
		await repo.save(image);
	}

	static async getImageById(size: ImageSize, id: number) {
		if (!MAX_RESOLUTION.hasOwnProperty(size)) {
			throw new Error(`ImageStore: invalid size specified "${size}`);
		}

		const image = await (await imageRepository).findOne(id);
		return image[size];
	}
}

