window.GM_setValue = (key, value) => {
    return localStorage.setItem(key, JSON.stringify(value));
};
window.GM_getValue = (key, fallback=null) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
};
