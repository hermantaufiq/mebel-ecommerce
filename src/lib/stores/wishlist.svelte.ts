import type { WishlistItem } from '$lib/types';
import { browser } from '$app/environment';

const WISHLIST_STORAGE_KEY = 'maison_lumina_wishlist';

export class WishlistStore {
	items = $state<WishlistItem[]>([]);

	constructor() {
		if (browser) {
			try {
				const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
				if (stored) {
					this.items = JSON.parse(stored);
				}
			} catch (err) {
				console.error('Failed to load wishlist from localStorage', err);
			}
		}
	}

	get itemCount(): number {
		return this.items.length;
	}

	isWishlisted(productId: string): boolean {
		return this.items.some((item) => item.productId === productId);
	}

	hasItem(productId: string): boolean {
		return this.isWishlisted(productId);
	}

	private save() {
		if (browser) {
			try {
				localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items));
			} catch (err) {
				console.error('Failed to save wishlist to localStorage', err);
			}
		}
	}

	private syncServer(productId: string) {
		if (browser) {
			fetch('/api/wishlist/toggle', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId })
			}).catch((err) => {
				console.warn('Background wishlist sync error:', err);
			});
		}
	}

	/**
	 * Toggle wishlist item. If item with same productId exists, removes it.
	 * Otherwise adds it with full metadata.
	 * Returns true if added, false if removed.
	 */
	toggleWishlist(item: WishlistItem): boolean {
		const index = this.items.findIndex((i) => i.productId === item.productId);
		let added = false;

		if (index > -1) {
			this.items.splice(index, 1);
			this.save();
			added = false;
		} else {
			this.items.push({
				...item,
				id: item.id || item.productId
			});
			this.save();
			added = true;
		}

		this.syncServer(item.productId);
		return added;
	}

	removeItem(productId: string) {
		const wasPresent = this.isWishlisted(productId);
		this.items = this.items.filter((item) => item.productId !== productId);
		this.save();

		if (wasPresent) {
			this.syncServer(productId);
		}
	}

	clearWishlist() {
		this.items = [];
		this.save();
	}

	/**
	 * Merge server items into client wishlist for logged-in user
	 */
	syncFromDatabase(serverItems: WishlistItem[]) {
		if (!serverItems || serverItems.length === 0) return;

		for (const sItem of serverItems) {
			if (!this.isWishlisted(sItem.productId)) {
				this.items.push(sItem);
			}
		}
		this.save();
	}
}

export const wishlistStore = new WishlistStore();
