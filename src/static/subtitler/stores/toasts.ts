import { writable } from 'svelte/store';

const TOAST_EXPIRATION_CHECK_INTERVAL = 50;

export interface ToastData {
	id: number | string;
	ttl: number; //time remaining until destroyed
	duration: number; //time the toast should be shown
	message: string;
	variant: 'info' | 'error';
}

// id is optional, ttl is internal
export type ToastEditable = Omit<ToastData, 'ttl' | 'id'> & Partial<Pick<ToastData, 'id'>>;

export const toasts = writable<ToastData[]>([]);

let toastId = 1;

export function createToast(toast: ToastEditable) {
	toasts.update((existingToasts) => {
		return [
			...existingToasts.filter((t) => t.id !== toast.id),
			{
				...toast,
				ttl: toast.duration,
				id: toast.id || toastId++,
			},
		];
	});
}

let lastCheckTime = Date.now();
setInterval(() => {
	const now = Date.now(),
		ttlDelta = now - lastCheckTime;
	lastCheckTime = now;

	toasts.update((toasts) => {
		return toasts
			.map((toast) => {
				return {
					...toast,
					ttl: toast.ttl - ttlDelta,
				};
			})
			.filter((toast) => toast.ttl > 0);
	});
}, TOAST_EXPIRATION_CHECK_INTERVAL);
