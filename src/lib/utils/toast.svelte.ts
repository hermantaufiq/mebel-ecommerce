export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

class ToastStore {
	toasts = $state<ToastItem[]>([]);

	show(type: ToastType, message: string, duration = 4000): string {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
		this.toasts.push({ id, type, message, duration });

		if (duration > 0 && typeof window !== 'undefined') {
			setTimeout(() => {
				this.dismiss(id);
			}, duration);
		}
		return id;
	}

	success(message: string, duration = 4000): string {
		return this.show('success', message, duration);
	}

	error(message: string, duration = 5000): string {
		return this.show('error', message, duration);
	}

	info(message: string, duration = 4000): string {
		return this.show('info', message, duration);
	}

	warning(message: string, duration = 4500): string {
		return this.show('warning', message, duration);
	}

	dismiss(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	clear() {
		this.toasts = [];
	}
}

export const toast = new ToastStore();
