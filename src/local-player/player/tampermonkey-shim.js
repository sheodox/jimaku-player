window.GM_setValue = (key, value) => {
    return localStorage.setItem(key, JSON.stringify(value));
};
window.GM_getValue = (key, fallback=null) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
};
let setClipboardWarned = false;
// no-op to prevent errors, cannot match the unprompted copies of GM_setClipboard
window.GM_setClipboard = () => {
    if (!setClipboardWarned) {
        setClipboardWarned = true;
        console.warn(`GM_setClipboard usage was attmepted, this is not polyfilled by the local Jimaku Player!`)
    }
}
