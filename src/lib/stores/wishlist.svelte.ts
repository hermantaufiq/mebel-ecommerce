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

	/**
	 * Toggle wishlist item. If item with same productId exists, removes it.
	 * Otherwise adds it with full metadata.
	 * Returns true if added, false if removed.
	 */
	toggleWishlist(item: WishlistItem): boolean {
		const index = this.items.findIndex((i) => i.productId === item.productId);
		if (index > -1) {
			this.items.splice(index, 1);
			this.save();
			return false;
		} else {
			this.items.push({
				...item,
				id: item.id || item.productId
			});
			this.save();
			return true;
		}
	}

	removeItem(productId: string) {
		this.items = this.items.filter((item) => item.productId !== productId);
		this.save();
	}

	clearWishlist() {
		this.items = [];
		this.save();
	}
}

export const wishlistStore = new WishlistStore();
