/*
Videos that are supported by the Jimaku Player dev server include both plain mp4 videos, as well as videos that
have been processed by Jimaku Player Ingest to generate a manifest file as well as undergoing MPEG-DASH processing.
*/

export interface VideoMetadata {
	// a generated ID
	id: string;
	// a pretty path to the video (no file extension, and no manifest path stuff)
	path: string;
	// 'dash' means the video has a manifest file and has MPEG-DASH processing through Jimaku Player Ingest.
	// Dash videos have support for alternative audio tracks and may have subtitles included in the manifest.
	// 'plain' means the video is just a single mp4 file, no special processing.
	type: 'dash' | 'plain';
	// the video
	name: string;
	// a path to the video file, used by thumbnail generation, not to be used directly as in a dash video this
	// video file won't have sound.
	_videoFilePath: string;
}

export interface DirectoryMetadata {
	type: 'directory';
	path: string;
	name: string;
	containedVideos: number;
	containedDirectories: number;
}

export interface VideoInfo {
	manifest?: ManifestFile;
	selectedVideo?: VideoMetadata;
	directories?: DirectoryMetadata[];
	videos?: VideoMetadata[];
	history?: DirectoryMetadata[];
}

export interface ManifestAudioTrack {
	language: string;
	title?: string;
	fileName: string;
	mpd: string;
	probe: Record<string, string | number>;
}

export interface ManifestSubtitleTrack {
	format: string;
	language: string;
	title: string;
	content: string;
}

export interface ManifestFile {
	title: string;
	video: {
		fileName: string;
		mpd: string;
		probe: Record<string, string | number>;
	};
	audio: ManifestAudioTrack[];
	subtitles: ManifestSubtitleTrack[];
}
