const userPausedReason = 'user-paused';

class VideoController {
	constructor() {
		this.video = null;
		this.reasons = [];
	}
	setVideo(videoElement) {
		this.reasons = [];
		this.video = videoElement;
	}
	//adds a reason to pause the video, allowing multiple things to have a reason to pause the video without them fighting for control
	addPauser(reason) {
		//if we've added a pause reason because the user had paused the video themselves, but the video is no longer paused, we need
		//to remove that reason or we'll never auto-resume playback, clearly that pauser is outdated
		if (this.reasons.includes(userPausedReason) && !this.video.paused) {
			this.reasons.splice(this.reasons.indexOf(userPausedReason));
		}
		//if the video has already been paused but there are no reasons, assume the user intentionally paused it
		if (this.reasons.length === 0 && this.video.paused) {
			//we need to add another reason signifying the user has paused the video themselves, this is a special case
			//otherwise we'll unpause the video though it shouldn't be.
			this.reasons.push(userPausedReason)
		}

		//add the new pauser, but don't allow it to be added more than once. there are currently no pausers that would be valid to have
		//more than once
		if (!this.reasons.includes(reason)) {
			this.reasons.push(reason);
		}
		this._checkPause();
	}
	removePauser(reason) {
		const i = this.reasons.indexOf(reason);
		if (i !== -1) {
			this.reasons.splice(i, 1);
			this._checkPause();
		}
	}
	//if there's no reason the video should be paused, play it
	_checkPause() {
		if (this.reasons.length) {
			this.video.pause();
		}
		else {
			this.video.play();
		}
	}
}

export const videoController = new VideoController();