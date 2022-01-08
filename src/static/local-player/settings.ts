class Settings {
	get(key: string, fallback?: any) {
		const lsValue = localStorage.getItem(key);
		return lsValue ? JSON.parse(lsValue) : fallback;
	}
	set(key: string, value: any = '') {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

export default new Settings();
