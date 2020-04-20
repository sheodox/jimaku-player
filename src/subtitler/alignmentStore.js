import {writable, derived} from 'svelte/store';

const getAlignmentKey = () => `last-used-alignment-${show}`;
let show = '';

export const alignmentStore = writable(0);
export const hasAlignmentStore = writable(false);

export const showNameStore = writable('');
showNameStore.subscribe(sn => {
	show = sn;
	const lastAlignment = GM_getValue(getAlignmentKey());
	alignmentStore.set(lastAlignment || 0);
	hasAlignmentStore.set(lastAlignment !== null);
});

//store any alignment change
alignmentStore.subscribe(value => {
	GM_setValue(getAlignmentKey(), value);
});

//transformed ways of presenting the alignment
export const secondsStore = derived(alignmentStore, $alignment => {
	//combination of parseFloat and toFixed will truncate at 2 decimal places,
	//and also remove insignificant decimals 2.454 -> 2.45, 3.00 -> 3 etc.
	return parseFloat(($alignment / 1000).toFixed(2))
});
//a store for displaying alignment as seconds, with a + sign if the number is positive,
//to more intuitively show that it's an offset
export const signedSecondsStore = derived(secondsStore, $seconds => {
	return $seconds > 0 ? `+${$seconds}` : $seconds;
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
