import {writable} from 'svelte/store';

export const videoInfo = writable({videos: [], directories: [], history: []});