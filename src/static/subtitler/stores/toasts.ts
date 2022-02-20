import { writable } from 'svelte/store';

const TOAST_EXPIRATION_CHECK_INTERVAL = 50;

export interface ToastData {
	id: number;
	ttl: number; //time remaining until destroyed
	duration: number; //time the toast should be shown
	message: string;
	variant: 'info' | 'error';
}

export const toasts = writable<ToastData[]>([]);

let toastId = 0;

export function createToast(toast: Omit<ToastData, 'ttl' | 'id'>) {
	toasts.update((existingToasts) => {
		return [
			...existingToasts,
			{
				...toast,
				ttl: toast.duration,
				id: toastId++,
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
