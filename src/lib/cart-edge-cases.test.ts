import { describe, it, expect, beforeEach } from 'vitest';
import { CartStore } from './stores/cart.svelte';
import { WishlistStore } from './stores/wishlist.svelte';
import { calculateCartTotals } from './cart-calculations';

describe('Tahap 3 Cart & Wishlist Edge Cases', () => {
	let cart: CartStore;
	let wishlist: WishlistStore;

	beforeEach(() => {
		cart = new CartStore();
		cart.setItems([]);
		wishlist = new WishlistStore();
		wishlist.clearWishlist();
	});

	describe('Koreksi 2: Snapshot timing and rollback', () => {
		it('preserves pre-batch snapshot during rapid consecutive increments and rolls back to pre-first-click state on sync failure', async () => {
			// 1. Initial cart setup with 1 item at qty = 1
			cart.setItems([
				{
					id: 'item-bench-1',
					productId: 'prod-bench',
					variantId: 'var-natural',
					name: 'Bench Kayu Jati',
					image: '/test.jpg',
					unitPrice: 1500000,
					qty: 1,
					maxStock: 10
				}
			]);
			cart.resetSnapshot();

			expect(cart.items[0]?.qty).toBe(1);
			expect(cart.getSnapshot()).toBeNull();

			// 2. User rapidly clicks '+' 3 times within the debounce window
			// Click 1: qty becomes 2, snapshot taken at qty = 1
			cart.incrementQty('item-bench-1');
			expect(cart.items[0]?.qty).toBe(2);
			const firstSnapshot = cart.getSnapshot();
			expect(firstSnapshot).not.toBeNull();
			expect(firstSnapshot![0]?.qty).toBe(1);

			// Click 2: qty becomes 3, snapshot MUST NOT be overwritten
			cart.incrementQty('item-bench-1');
			expect(cart.items[0]?.qty).toBe(3);
			expect(cart.getSnapshot()![0]?.qty).toBe(1);

			// Click 3: qty becomes 4, snapshot MUST STILL be 1
			cart.incrementQty('item-bench-1');
			expect(cart.items[0]?.qty).toBe(4);
			expect(cart.getSnapshot()![0]?.qty).toBe(1);

			// 3. Simulate sync failure (e.g., server returned 500 or network drop)
			cart.rollback('Koneksi terputus saat menyinkronkan keranjang');

			// 4. Verify state rolled back to qty before the FIRST click (1, NOT 2 or 3)
			expect(cart.items[0]?.qty).toBe(1);
			// Verify snapshot is now cleared
			expect(cart.getSnapshot()).toBeNull();
			expect(cart.isSyncing).toBe(false);
		});

		it('clears snapshot upon successful sync', async () => {
			cart.setItems([
				{
					id: 'item-bench-2',
					productId: 'prod-bench',
					variantId: null,
					name: 'Kursi Rotan',
					image: '/test.jpg',
					unitPrice: 800000,
					qty: 1,
					maxStock: 10
				}
			]);
			cart.resetSnapshot();

			// Mock successful sync handler
			cart.setSyncHandler(async () => ({ success: true }));

			cart.incrementQty('item-bench-2');
			expect(cart.items[0]?.qty).toBe(2);
			expect(cart.getSnapshot()).not.toBeNull();

			// Flush sync successfully
			const success = await cart.flushSync();
			expect(success).toBe(true);
			expect(cart.items[0]?.qty).toBe(2);
			expect(cart.getSnapshot()).toBeNull();
		});
	});

	describe('Cart item uniqueness & variant separation (Aturan 1 & 2)', () => {
		it('creates two distinct cart lines for the same productId with different variantIds', () => {
			cart.addItem({
				productId: 'meja-dining',
				variantId: 'oak-finish',
				name: 'Meja Makan Minimalis (Oak)',
				image: '/meja.jpg',
				unitPrice: 5000000,
				qty: 1,
				maxStock: 5
			});

			cart.addItem({
				productId: 'meja-dining',
				variantId: 'walnut-finish',
				name: 'Meja Makan Minimalis (Walnut)',
				image: '/meja.jpg',
				unitPrice: 5500000,
				qty: 1,
				maxStock: 5
			});

			expect(cart.items.length).toBe(2);
			expect(cart.uniqueItemCount).toBe(2);
			expect(cart.itemCount).toBe(2);
			expect(cart.hasItem('meja-dining', 'oak-finish')).toBe(true);
			expect(cart.hasItem('meja-dining', 'walnut-finish')).toBe(true);
		});

		it('increments quantity and clamps to maxStock for same productId and same variantId', () => {
			cart.addItem({
				productId: 'kursi-lounge',
				variantId: 'leather-black',
				name: 'Kursi Lounge',
				image: '/kursi.jpg',
				unitPrice: 2000000,
				qty: 2,
				maxStock: 4
			});

			// Add 3 more units — total would be 5, but maxStock is 4
			cart.addItem({
				productId: 'kursi-lounge',
				variantId: 'leather-black',
				name: 'Kursi Lounge',
				image: '/kursi.jpg',
				unitPrice: 2000000,
				qty: 3,
				maxStock: 4
			});

			expect(cart.items.length).toBe(1);
			expect(cart.items[0]?.qty).toBe(4);
		});
	});

	describe('Decrement & removal (Aturan 3)', () => {
		it('removes item when decrementing from qty = 1', () => {
			cart.addItem({
				id: 'kursi-1',
				productId: 'kursi-kerja',
				variantId: null,
				name: 'Kursi Kerja Ergonomis',
				image: '/kursi.jpg',
				unitPrice: 1200000,
				qty: 1,
				maxStock: 10
			});

			expect(cart.items.length).toBe(1);
			const result = cart.decrementQty('kursi-1');
			expect(result).toBe('removed');
			expect(cart.items.length).toBe(0);
		});

		it('decrements item when qty > 1', () => {
			cart.addItem({
				id: 'kursi-2',
				productId: 'kursi-kerja',
				variantId: null,
				name: 'Kursi Kerja Ergonomis',
				image: '/kursi.jpg',
				unitPrice: 1200000,
				qty: 3,
				maxStock: 10
			});

			const result = cart.decrementQty('kursi-2');
			expect(result).toBe('decremented');
			expect(cart.items[0]?.qty).toBe(2);
		});
	});

	describe('Totals calculation & discount clamping (Aturan 4)', () => {
		it('clamps total to 0 when discount exceeds subtotal', () => {
			const items = [{ unitPrice: 300000, qty: 1 }];
			const result = calculateCartTotals(items, { discount: 500000 });

			expect(result.subtotal).toBe(300000);
			expect(result.discount).toBe(500000);
			expect(result.total).toBe(0);
		});
	});

	describe('Koreksi 1: Stock validation & adjustment tracking', () => {
		it('clamps item qty to availableStock and returns adjusted item IDs', () => {
			cart.setItems([
				{
					id: 'item-adjust-1',
					productId: 'prod-rak',
					variantId: 'var-3-tingkat',
					name: 'Rak Buku',
					image: '/rak.jpg',
					unitPrice: 1800000,
					qty: 5,
					maxStock: 10
				},
				{
					id: 'item-adjust-2',
					productId: 'prod-meja',
					variantId: null,
					name: 'Meja Tamu',
					image: '/meja.jpg',
					unitPrice: 900000,
					qty: 2,
					maxStock: 5
				}
			]);

			const validationResponse = [
				{
					id: 'item-adjust-1',
					productId: 'prod-rak',
					variantId: 'var-3-tingkat',
					isAvailable: true,
					availableStock: 2, // Stock reduced from 10 to 2
					currentPrice: 1800000,
					adjustedQty: 2
				},
				{
					id: 'item-adjust-2',
					productId: 'prod-meja',
					variantId: null,
					isAvailable: true,
					availableStock: 5, // Unchanged
					currentPrice: 900000,
					adjustedQty: 2
				}
			];

			const result = cart.syncWithValidated(validationResponse);

			expect(result.adjustedCount).toBe(1);
			expect(result.removedCount).toBe(0);
			expect(result.adjustedItemIds).toEqual(['item-adjust-1']);
			expect(cart.items[0]?.qty).toBe(2);
			expect(cart.items[0]?.maxStock).toBe(2);
			expect(cart.items[1]?.qty).toBe(2);
		});
	});

	describe('Wishlist toggle idempotency (Aturan 5 & Koreksi 4)', () => {
		it('correctly toggles items on and off in the client store', () => {
			const wishItem = {
				productId: 'sofa-nordic',
				name: 'Sofa Nordic 3 Seater',
				price: 7800000,
				image: '/sofa.jpg',
				slug: 'sofa-nordic-3-seater',
				category: 'Ruang Tamu'
			};

			// 1st toggle: adds item
			const added = wishlist.toggleWishlist(wishItem);
			expect(added).toBe(true);
			expect(wishlist.itemCount).toBe(1);
			expect(wishlist.isWishlisted('sofa-nordic')).toBe(true);

			// 2nd toggle: removes item
			const removed = wishlist.toggleWishlist(wishItem);
			expect(removed).toBe(false);
			expect(wishlist.itemCount).toBe(0);
			expect(wishlist.isWishlisted('sofa-nordic')).toBe(false);
		});

		it('syncFromDatabase merges items without duplicates', () => {
			wishlist.toggleWishlist({
				productId: 'item-local',
				name: 'Lampu Meja',
				price: 450000,
				image: '/lamp.jpg',
				slug: 'lampu-meja'
			});

			wishlist.syncFromDatabase([
				{
					productId: 'item-local', // duplicate from server
					name: 'Lampu Meja',
					price: 450000,
					image: '/lamp.jpg',
					slug: 'lampu-meja'
				},
				{
					productId: 'item-server-only',
					name: 'Karpet Wol',
					price: 1200000,
					image: '/rug.jpg',
					slug: 'karpet-wol'
				}
			]);

			expect(wishlist.itemCount).toBe(2);
			expect(wishlist.isWishlisted('item-local')).toBe(true);
			expect(wishlist.isWishlisted('item-server-only')).toBe(true);
		});
	});
});
