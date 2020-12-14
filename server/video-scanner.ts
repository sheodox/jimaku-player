import {promisify} from "util";

const glob = promisify(require('glob')),
    scanned = {
        videos: [] as string[],
        directories: [] as string[]
    };

/**
 * Get all the videos available.
 */
export function scanVideos() {
    return scanned.videos;
}

/**
 * Get all the directories in the video folder
 */
export function scanVideoDirectories() {
    return scanned.directories;
}

function countInPath(path: string, globbed: string[]) {
    const globStylePath = `./${path}`
    return globbed.reduce((total, vidPath) => {
        return total + (vidPath.startsWith(globStylePath) ? 1 : 0);
    }, 0);
}

export function countVideosInPath(dir: string) {
    return countInPath(dir, scanned.videos);
}
export function countDirectoriesInPath(dir: string) {
    //this directory is always going to be considered a match, but we
    //want anything inside it, so subtract one to not consider itself
    return countInPath(dir, scanned.directories) - 1;
}

/**
 * Videos are scanned for by looking for a metadata file, but that's an ugly path to show the browser,
 * this removes that ugly portion of the path so we can ignore that on the front end and only
 * care about the metadata stuff in code.
 * @param paths
 */
export function deMetaPaths(paths: string[]) {
    return paths.map(p => p.replace(/-metadata\.json$/, ''));
}

async function rescan() {
    scanned.videos = deMetaPaths(await glob('./videos/**/*-metadata.json'));
    scanned.directories = [
        './videos/',
        ...await glob('./videos/**/*/')
    ];
}
//every so often check for new videos, cache it so navigation is fast whenever it's needed
setInterval(rescan, 5 * 60 * 1000);
rescan();
