import {writable, derived} from 'svelte/store';

const getAlignmentKey = () => `last-used-alignment-${show}`,
	getHistoryKey = () => `alignment-history-${show}`,
	//be aware this isn't the display max, the current alignment will be included in here and it
	//gets filtered out in the alignment component
	HISTORY_MAX = 5;
let show = '';

//the current alignment
export const alignmentStore = writable(0);
//whether an alignment has ever been set for this show
export const hasAlignmentStore = writable(false);
//the last few alignments used for this show
export const alignmentHistoryStore = writable(0);

export const showNameStore = writable('');
showNameStore.subscribe(sn => {
	show = sn;
	const lastAlignment = GM_getValue(getAlignmentKey());
	alignmentHistoryStore.set(GM_getValue(getHistoryKey(), [createHistoryEntry(0)]));
	alignmentStore.set(lastAlignment || 0);
	hasAlignmentStore.set(lastAlignment !== null);
});

//store any alignment change
alignmentStore.subscribe(alignment => {
	GM_setValue(getAlignmentKey(), alignment);
	alignmentHistoryStore.update((history = []) => {
		return history.find(hist => hist.alignment === alignment)
			? history
			: [
				createHistoryEntry(alignment),
				...history
			].slice(0, HISTORY_MAX);
	})
});
alignmentHistoryStore.subscribe(history => {
	GM_setValue(getHistoryKey(), history);
});

function createHistoryEntry(alignment) {
	return {
		alignment,
		signed: msToSigned(alignment)
	};
}
function msToSigned(ms) {
	const seconds = parseFloat((ms / 1000).toFixed(2));
	return seconds > 0 ? `+${seconds}` : seconds;
}

//transformed ways of presenting the alignment
export const secondsStore = derived(alignmentStore, $alignment => {
	//combination of parseFloat and toFixed will truncate at 2 decimal places,
	//and also remove insignificant decimals 2.454 -> 2.45, 3.00 -> 3 etc.
	return parseFloat(($alignment / 1000).toFixed(2))
});
//a store for displaying alignment as seconds, with a + sign if the number is positive,
//to more intuitively show that it's an offset
export const signedSecondsStore = derived(alignmentStore, $alignment => {
	return msToSigned($alignment);
});
//a store for displaying the alignment as an explanation that's more understandable
//than just an offset number.
export const explainedSecondsStore = derived(secondsStore, $seconds => {
	if ($seconds === 0) {
		return `no adjustment`;
	}
	return $seconds > 0
		? `delayed by ${$seconds} seconds`
		: `hastened by ${Math.abs($seconds)} seconds`;
});
