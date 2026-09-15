import type { CartItem } from '$lib/types';
import { calculateCartTotals, type CartTotals } from '$lib/cart-calculations';
import { browser } from '$app/environment';

const CART_STORAGE_KEY = 'maison_lumina_cart';

export class CartStore {
	items = $state<CartItem[]>([]);

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
		const targetVariant = newItem.variantId ?? null;
		const existingIndex = this.items.findIndex(
			(item) => item.productId === newItem.productId && (item.variantId ?? null) === targetVariant
		);

		if (existingIndex > -1) {
			const existing = this.items[existingIndex];
			const maxStock = existing.maxStock || 99;
			const newQty = Math.min(existing.qty + newItem.qty, maxStock);
			this.items[existingIndex] = {
				...existing,
				qty: newQty
			};
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
	}

	addMultipleItems(newItems: Array<Omit<CartItem, 'id'> & { id?: string }>) {
		for (const newItem of newItems) {
			const targetVariant = newItem.variantId ?? null;
			const existingIndex = this.items.findIndex(
				(item) => item.productId === newItem.productId && (item.variantId ?? null) === targetVariant
			);

			if (existingIndex > -1) {
				const existing = this.items[existingIndex];
				const maxStock = existing.maxStock || 99;
				const newQty = Math.min(existing.qty + newItem.qty, maxStock);
				this.items[existingIndex] = {
					...existing,
					qty: newQty
				};
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
		}
		this.save();
	}

	removeItem(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
		this.save();
	}

	updateQty(id: string, qty: number) {
		if (qty <= 0) {
			this.removeItem(id);
			return;
		}
		const item = this.items.find((i) => i.id === id);
		if (item) {
			const maxStock = item.maxStock || 99;
			item.qty = Math.min(qty, maxStock);
			this.save();
		}
	}

	incrementQty(id: string) {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			const maxStock = item.maxStock || 99;
			if (item.qty < maxStock) {
				item.qty += 1;
				this.save();
			}
		}
	}

	decrementQty(id: string): 'decremented' | 'removed' {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			if (item.qty > 1) {
				item.qty -= 1;
				this.save();
				return 'decremented';
			} else {
				this.removeItem(id);
				return 'removed';
			}
		}
		return 'removed';
	}

	clearCart() {
		this.items = [];
		this.save();
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
	): { adjustedCount: number; removedCount: number } {
		let adjustedCount = 0;
		let removedCount = 0;
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

		return { adjustedCount, removedCount };
	}
}

export const cartStore = new CartStore();
