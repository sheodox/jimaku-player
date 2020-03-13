export default class VideoController {
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
		this.reasons.push(reason);
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

