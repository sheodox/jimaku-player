export const logLevels = {
	streaming: false
};

export class Logger{
	constructor(origin) {
		this.origin = origin;
		if (!origin) {
			throw new Error('Logger needs an origin, none was passed! This identifies where the log message originated from.');
		}
	}
	_log(...args) {
		console.log(`[${this.origin}]`, ...args);
	}
	error(...args) {
		//errors are always shown
		console.error(`[${this.origin}]`, ...args);
	}
	streaming(...args) {
		if (logLevels.streaming) {
			this._log(...args);
		}
	}
}

