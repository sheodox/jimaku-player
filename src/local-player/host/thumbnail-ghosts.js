import {writable} from "svelte/store";

//a 'ghost' is a subtle duplicate blurred image int he background
export const selectedGhost = writable(null);