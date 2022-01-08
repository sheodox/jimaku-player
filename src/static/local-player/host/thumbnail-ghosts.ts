import { writable } from 'svelte/store';

//a 'ghost' is a subtle duplicate blurred image in the background
export const selectedGhost = writable<string>(null);
