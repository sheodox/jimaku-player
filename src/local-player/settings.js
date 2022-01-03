class Settings {
	get(key, fallback) {
		const lsValue = localStorage.getItem(key);
		return lsValue ? JSON.parse(lsValue) : fallback;
	}
	set(key, value = '') {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

export default new Settings();
