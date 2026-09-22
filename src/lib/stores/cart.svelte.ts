import type { CartItem } from '$lib/types';
import { calculateCartTotals, type CartTotals } from '$lib/cart-calculations';
import { browser } from '$app/environment';
import { toast } from '$lib/utils/toast';
import { SvelteMap } from 'svelte/reactivity';

const CART_STORAGE_KEY = 'maison_lumina_cart';

export type CartAction = 'add' | 'updateQty' | 'remove' | 'clear';

export interface CartSyncMutation {
	action: CartAction;
	productId?: string;
	variantId?: string | null;
	qty?: number;
}

export class CartStore {
	items = $state<CartItem[]>([]);
	isSyncing = $state<boolean>(false);

	// Snapshot for optimistic UI rollback (Koreksi 2)
	private pendingSnapshot: CartItem[] | null = null;
	private syncTimeout: ReturnType<typeof setTimeout> | null = null;
	private pendingMutations: SvelteMap<string, CartSyncMutation> = new SvelteMap();
	private syncHandler?: (mutations: CartSyncMutation[]) => Promise<{ success: boolean; error?: string }>;

	constructor() {
		if (browser) {
			try {
				const stored = localStorage.getItem(CART_STORAGE_KEY);
				if (stored) {
					this.items = JSON.parse(stored);
				}
			} catch (err) {
				console.error('Failed to load cart from localStorage', err);
			}
		}
	}

	get itemCount(): number {
		return this.items.reduce((sum, item) => sum + item.qty, 0);
	}

	get uniqueItemCount(): number {
		return this.items.length;
	}

	get totals(): CartTotals {
		return calculateCartTotals(this.items);
	}

	get subtotal(): number {
		return this.totals.subtotal;
	}

	private save() {
		if (browser) {
			try {
				localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
			} catch (err) {
				console.error('Failed to save cart to localStorage', err);
			}
		}
	}

	/**
	 * Takes a snapshot ONLY ONCE at the start of a mutation batch (Koreksi 2).
	 * If a snapshot is already pending within the debounce window, it is not overwritten.
	 */
	private ensureSnapshot() {
		if (this.pendingSnapshot === null && !this.isSyncing) {
			this.pendingSnapshot = JSON.parse(JSON.stringify(this.items));
		}
	}

	getSnapshot(): CartItem[] | null {
		return this.pendingSnapshot ? JSON.parse(JSON.stringify(this.pendingSnapshot)) : null;
	}

	setSyncHandler(handler?: (mutations: CartSyncMutation[]) => Promise<{ success: boolean; error?: string }>) {
		this.syncHandler = handler;
	}

	/**
	 * Rollback cart to state before the batch of actions started (Koreksi 2).
	 */
	rollback(errorMessage?: string) {
		if (this.pendingSnapshot !== null) {
			this.items = JSON.parse(JSON.stringify(this.pendingSnapshot));
			this.save();
		}
		this.pendingSnapshot = null;
		this.isSyncing = false;
		if (this.syncTimeout) {
			clearTimeout(this.syncTimeout);
			this.syncTimeout = null;
		}
		this.pendingMutations.clear();
		if (errorMessage && browser) {
			toast.error(errorMessage);
		}
	}

	/**
	 * Reset snapshot after successful sync or reset
	 */
	resetSnapshot() {
		this.pendingSnapshot = null;
	}

	/**
	 * Schedule debounced delta sync to backend (Koreksi 3)
	 */
	private scheduleSync(mutation: CartSyncMutation) {
		const key =
			mutation.action === 'clear'
				? 'CLEAR_ALL'
				: `${mutation.productId}:${mutation.variantId || 'novar'}`;
		this.pendingMutations.set(key, mutation);

		if (this.syncTimeout) {
			clearTimeout(this.syncTimeout);
		}

		this.syncTimeout = setTimeout(() => {
			this.flushSync();
		}, 400);
	}

	async flushSync(): Promise<boolean> {
		if (this.pendingMutations.size === 0) return true;

		const mutationsToSend = Array.from(this.pendingMutations.values());
		this.pendingMutations.clear();
		this.isSyncing = true;

		try {
			if (this.syncHandler) {
				const res = await this.syncHandler(mutationsToSend);
				if (!res.success) {
					throw new Error(res.error || 'Sinkronisasi gagal');
				}
			} else if (browser) {
				const payload =
					mutationsToSend.length === 1
						? mutationsToSend[0]
						: { mutations: mutationsToSend };

				const res = await fetch('/api/cart/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data.error || `Server error: ${res.status}`);
				}
			}

			// Sync successful: reset snapshot and state
			this.isSyncing = false;
			this.pendingSnapshot = null;
			return true;
		} catch (err: any) {
			this.rollback(err.message || 'Gagal menyinkronkan keranjang dengan server');
			return false;
		}
	}

	hasItem(productId: string, variantId?: string | null): boolean {
		const targetVariant = variantId ?? null;
		return this.items.some(
			(item) => item.productId === productId && (item.variantId ?? null) === targetVariant
		);
	}

	getItem(productId: string, variantId?: string | null): CartItem | undefined {
		const targetVariant = variantId ?? null;
		return this.items.find(
			(item) => item.productId === productId && (item.variantId ?? null) === targetVariant
		);
	}

	addItem(newItem: Omit<CartItem, 'id'> & { id?: string }) {
		this.ensureSnapshot();

		const targetVariant = newItem.variantId ?? null;
		const existingIndex = this.items.findIndex(
			(item) => item.productId === newItem.productId && (item.variantId ?? null) === targetVariant
		);

		let addedQty = newItem.qty;
		if (existingIndex > -1) {
			const existing = this.items[existingIndex];
			if (existing) {
				const maxStock = existing.maxStock || 99;
				const newQty = Math.min(existing.qty + newItem.qty, maxStock);
				addedQty = newQty - existing.qty;
				this.items[existingIndex] = {
					...existing,
					qty: newQty
				};
			}
		} else {
			const id =
				newItem.id ||
				(typeof crypto !== 'undefined' && crypto.randomUUID
					? crypto.randomUUID()
					: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
			this.items.push({
				...newItem,
				id,
				variantId: targetVariant
			});
		}

		this.save();
		this.scheduleSync({
			action: 'add',
			productId: newItem.productId,
			variantId: targetVariant,
			qty: addedQty
		});
	}

	addMultipleItems(newItems: Array<Omit<CartItem, 'id'> & { id?: string }>) {
		this.ensureSnapshot();

		for (const newItem of newItems) {
			const targetVariant = newItem.variantId ?? null;
			const existingIndex = this.items.findIndex(
				(item) => item.productId === newItem.productId && (item.variantId ?? null) === targetVariant
			);

			let addedQty = newItem.qty;
			if (existingIndex > -1) {
				const existing = this.items[existingIndex];
				if (existing) {
					const maxStock = existing.maxStock || 99;
					const newQty = Math.min(existing.qty + newItem.qty, maxStock);
					addedQty = newQty - existing.qty;
					this.items[existingIndex] = {
						...existing,
						qty: newQty
					};
				}
			} else {
				const id =
					newItem.id ||
					(typeof crypto !== 'undefined' && crypto.randomUUID
						? crypto.randomUUID()
						: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
				this.items.push({
					...newItem,
					id,
					variantId: targetVariant
				});
			}

			this.scheduleSync({
				action: 'add',
				productId: newItem.productId,
				variantId: targetVariant,
				qty: addedQty
			});
		}

		this.save();
	}

	removeItem(id: string) {
		const targetItem = this.items.find((i) => i.id === id);
		if (!targetItem) return;

		this.ensureSnapshot();
		this.items = this.items.filter((item) => item.id !== id);
		this.save();

		this.scheduleSync({
			action: 'remove',
			productId: targetItem.productId,
			variantId: targetItem.variantId ?? null
		});
	}

	updateQty(id: string, qty: number) {
		if (qty <= 0) {
			this.removeItem(id);
			return;
		}

		const item = this.items.find((i) => i.id === id);
		if (item) {
			this.ensureSnapshot();
			const maxStock = item.maxStock || 99;
			item.qty = Math.min(qty, maxStock);
			this.save();

			this.scheduleSync({
				action: 'updateQty',
				productId: item.productId,
				variantId: item.variantId ?? null,
				qty: item.qty
			});
		}
	}

	incrementQty(id: string) {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			const maxStock = item.maxStock || 99;
			if (item.qty < maxStock) {
				this.ensureSnapshot();
				item.qty += 1;
				this.save();

				this.scheduleSync({
					action: 'updateQty',
					productId: item.productId,
					variantId: item.variantId ?? null,
					qty: item.qty
				});
			}
		}
	}

	decrementQty(id: string): 'decremented' | 'removed' {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			if (item.qty > 1) {
				this.ensureSnapshot();
				item.qty -= 1;
				this.save();

				this.scheduleSync({
					action: 'updateQty',
					productId: item.productId,
					variantId: item.variantId ?? null,
					qty: item.qty
				});
				return 'decremented';
			} else {
				this.removeItem(id);
				return 'removed';
			}
		}
		return 'removed';
	}

	clearCart() {
		this.ensureSnapshot();
		this.items = [];
		this.save();
		this.scheduleSync({ action: 'clear' });
	}

	setItems(items: CartItem[]) {
		this.items = items;
		this.save();
	}

	syncWithValidated(
		validatedList: Array<{
			id?: string;
			productId: string;
			variantId?: string | null;
			isAvailable: boolean;
			availableStock: number;
			currentPrice: number;
			adjustedQty: number;
		}>
	): { adjustedCount: number; removedCount: number; adjustedItemIds: string[] } {
		let adjustedCount = 0;
		let removedCount = 0;
		const adjustedItemIds: string[] = [];
		const nextItems: CartItem[] = [];

		for (const item of this.items) {
			const targetVariant = item.variantId ?? null;
			const match = validatedList.find(
				(v) =>
					(v.id && v.id === item.id) ||
					(v.productId === item.productId && (v.variantId ?? null) === targetVariant)
			);

			if (!match || !match.isAvailable || match.availableStock <= 0) {
				removedCount++;
				continue;
			}

			let newQty = item.qty;
			if (item.qty > match.availableStock) {
				newQty = match.availableStock;
				adjustedCount++;
				adjustedItemIds.push(item.id);
			}

			nextItems.push({
				...item,
				qty: newQty,
				maxStock: match.availableStock,
				unitPrice: match.currentPrice
			});
		}

		this.items = nextItems;
		this.save();

		return { adjustedCount, removedCount, adjustedItemIds };
	}
}

export const cartStore = new CartStore();
