import { writable, derived } from 'svelte/store';

const getAlignmentKey = () => `last-used-alignment-${show}`,
	getHistoryKey = () => `alignment-history-${show}`,
	//be aware this isn't the display max, the current alignment will be included in here and it
	//gets filtered out in the alignment component
	HISTORY_MAX = 5;
let show = '';

//the current alignment in use
export const alignmentStore = writable<number>(null);
//whether an alignment has ever been set for this show
export const hasAlignmentStore = writable(false);

//the last few alignments used for this show
const historyStore = writable<{ alignment: number; signed: string }[]>([]);
//
//mirror the history store in a way that can't be mutated without using the exported 'saveAlignmentToHistory'
export const alignmentHistoryStore = derived(historyStore, (history) => {
	//the history store moves the most recent alignment to index 0, so everything beyond that
	//is the history beyond the current/in-use alignment
	return history.slice(1);
});

export const showNameStore = writable('');
showNameStore.subscribe((sn) => {
	show = sn;
	const lastAlignment = GM_getValue(getAlignmentKey());
	historyStore.set(GM_getValue(getHistoryKey(), []));
	alignmentStore.set(lastAlignment);
	hasAlignmentStore.set(typeof lastAlignment === 'number');
});

//store any alignment change
alignmentStore.subscribe((alignment) => {
	GM_setValue(getAlignmentKey(), alignment);
	hasAlignmentStore.set(typeof alignment === 'number');
});

//the history store shouldn't be mutated directly, use this function
export const saveAlignmentToHistory = (alignment: number) => {
	//don't store the initial blank value of the alignment in the history
	if (alignment === null) {
		return;
	}

	historyStore.update((history = []) => {
		//even if this was in the history, reinsert it at the front so something in use doesn't fall off the history
		return [
			createHistoryEntry(alignment),
			...history.filter((historyItem) => historyItem.alignment !== alignment),
		].slice(0, HISTORY_MAX);
	});
};

historyStore.subscribe((history) => {
	GM_setValue(getHistoryKey(), history);
});

function createHistoryEntry(alignment: number) {
	return {
		alignment,
		signed: msToSigned(alignment),
	};
}
function msToSigned(ms: number) {
	const seconds = parseFloat((ms / 1000).toFixed(2));
	// add a + to positive alignments so it's more clear
	return seconds > 0 ? `+${seconds}` : '' + seconds;
}

//transformed ways of presenting the alignment
export const secondsStore = derived(alignmentStore, ($alignment) => {
	//combination of parseFloat and toFixed will truncate at 2 decimal places,
	//and also remove insignificant decimals 2.454 -> 2.45, 3.00 -> 3 etc.
	return parseFloat(($alignment / 1000).toFixed(2));
});
//a store for displaying alignment as seconds, with a + sign if the number is positive,
//to more intuitively show that it's an offset
export const signedSecondsStore = derived(alignmentStore, ($alignment) => {
	return msToSigned($alignment);
});
//a store for displaying the alignment as an explanation that's more understandable
//than just an offset number.
export const explainedSecondsStore = derived(secondsStore, ($seconds) => {
	if ($seconds === 0) {
		return `no adjustment`;
	}
	return $seconds > 0 ? `delayed by ${$seconds} seconds` : `hastened by ${Math.abs($seconds)} seconds`;
});
