import { promisify } from 'util';
import path from 'path';
import { nanoid } from 'nanoid';
import fs from 'fs';
import globImport from 'glob';
import type { VideoMetadata, ManifestFile } from '../shared/types/videos';

const glob = promisify(globImport) as (pattern: string) => Promise<string[]>;

/**
 * Videos are scanned for by looking for a manifest file, but that's an ugly path to show the browser,
 * this removes that ugly portion of the path so we can ignore that on the front end and only
 * care about the manifest stuff in code.
 * @param paths
 */
export function deManifestPath(manifestFileName: string) {
	return manifestFileName.replace(/-manifest\.json$/, '');
}

let saveMetadataTimeout: ReturnType<typeof setTimeout>;

interface VideoManagerMetadata {
	// this number can be incremented in the even that the metadata schema changes to invalidate it
	schemaVersion: number;
	videos: VideoMetadata[];
	directories: string[];
}

const METADATA_PATH = './data/video-metadata.json',
	SCAN_INTERVAL = 1000 * 60 * 10, // ten minutes
	CURRENT_SCHEMA_VERSION = 0;

class VideoScanner {
	metadata: VideoManagerMetadata;
	constructor() {
		try {
			this.metadata = JSON.parse(fs.readFileSync(METADATA_PATH).toString());

			if (this.metadata.schemaVersion < CURRENT_SCHEMA_VERSION) {
				this.resetMetadata();
			}
		} catch (e) {
			this.resetMetadata();
		}

		this.scan();

		setInterval(() => {
			this.scan();
		}, SCAN_INTERVAL);
	}

	isVideoPath(p: string) {
		return this.metadata.videos.some((video) => video.path === p);
	}

	countVideosInPath(dirPath: string) {
		return this.metadata.videos.filter((video) => {
			return video.path.startsWith(dirPath);
		}).length;
	}

	getDirectoriesInPath(dirPath: string) {
		if (!dirPath.endsWith('/')) {
			dirPath += '/';
		}
		return this.metadata.directories.filter((dir) => {
			return dir !== dirPath && dir.startsWith(dirPath);
		});
	}

	countDirectoriesInPath(dirPath: string) {
		return this.getDirectoriesInPath(dirPath).length;
	}

	getVideosInPath(containingDirectory: string) {
		return this.metadata.videos.filter((videoMetadata) => {
			return path.resolve(containingDirectory) === path.resolve(path.dirname(videoMetadata.path));
		});
	}

	getVideoByPath(videoPath: string) {
		return this.metadata.videos.find((video) => {
			return video.path === videoPath;
		});
	}

	getVideoById(id: string) {
		return this.metadata.videos.find((video) => {
			return video.id === id;
		});
	}

	private resetMetadata() {
		this.metadata = {
			schemaVersion: CURRENT_SCHEMA_VERSION,
			videos: [],
			directories: [],
		};
	}

	private saveMetadata() {
		// debounce, just in case a lot of saving happens, probably won't
		clearTimeout(saveMetadataTimeout);
		saveMetadataTimeout = setTimeout(async () => {
			await fs.promises.writeFile(METADATA_PATH, JSON.stringify(this.metadata, null, 4));
		}, 1000);
	}
	private async scan() {
		const [videoManifestPaths, mp4Paths, videoDirectories] = await Promise.all([
			glob('./videos/**/*-manifest.json'),
			glob('./videos/**/*.mp4'),
			glob('./videos/**/*/'),
		]);

		this.metadata.directories = ['./videos/', ...videoDirectories];

		const plainVideoPaths = mp4Paths.filter((mp4Path: string) => {
			// ingested mp4 videos will start with two underscores, omit those from the results
			// as they are included implicitly as part of the manifest scanning
			return !path.basename(mp4Path).startsWith('__');
		});

		await Promise.all([this.generateDashMetadata(videoManifestPaths), this.generatePlainMetadata(plainVideoPaths)]);
		this.saveMetadata();
	}

	private async generateDashMetadata(videoManifestPaths: string[]) {
		for (const manifestPath of videoManifestPaths) {
			const cleanPath = deManifestPath(manifestPath),
				isCached = !!this.getVideoByPath(cleanPath);

			if (!isCached) {
				// don't cache the manifests, these can be gigantic files potentially
				const manifest: ManifestFile = JSON.parse((await fs.promises.readFile(manifestPath)).toString());

				this.metadata.videos.push({
					id: nanoid(),
					type: 'dash',
					path: cleanPath,
					name: manifest.title,
					_videoFilePath: path.join(path.dirname(manifestPath), manifest.video.fileName),
				});
			}
		}
	}

	private async generatePlainMetadata(videoPaths: string[]) {
		for (const videoPath of videoPaths) {
			const cleanPath = videoPath.replace(/\.mp4$/, ''),
				isCached = !!this.getVideoByPath(cleanPath);

			if (!isCached) {
				this.metadata.videos.push({
					id: nanoid(),
					type: 'plain',
					path: cleanPath,
					name: path.basename(videoPath, '.mp4'),
					_videoFilePath: videoPath,
				});
			}
		}
	}
}

export const videoScanner = new VideoScanner();
