export const logLevels = {
	streaming: false,
};

export class Logger {
	origin: string;
	constructor(origin: string) {
		this.origin = origin;
		if (!origin) {
			throw new Error(
				'Logger needs an origin, none was passed! This identifies where the log message originated from.'
			);
		}
	}
	_log(...args: any[]) {
		console.log(`[${this.origin}]`, ...args);
	}
	error(...args: any[]) {
		//errors are always shown
		console.error(`[${this.origin}]`, ...args);
	}
	streaming(...args: any[]) {
		if (logLevels.streaming) {
			this._log(...args);
		}
	}
}
