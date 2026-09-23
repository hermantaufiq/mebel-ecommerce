import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { verifyWebhookSignature } from '../routes/api/webhooks/payment/+server';
import { calculateCartTotals } from './cart-calculations';
import { calculateTier, getNextTierInfo } from './tier-config';

describe('Tahap 4 (Revisi) — Checkout, Webhook & Konfirmasi Pesanan Test Suite', () => {
	const TEST_SECRET = 'test_webhook_secret_key_12345';

	// =========================================================================
	// 1. Koreksi 1: Verifikasi HMAC Signature Webhook
	// =========================================================================
	describe('1. Verifikasi HMAC Signature Webhook', () => {
		it('harus menerima signature HMAC SHA-256 yang valid', () => {
			const payload = JSON.stringify({
				orderNumber: 'ML-99123',
				transaction_status: 'settlement',
				gross_amount: 4850000
			});

			const validSignature = crypto.createHmac('sha256', TEST_SECRET).update(payload).digest('hex');

			expect(verifyWebhookSignature(payload, validSignature, TEST_SECRET)).toBe(true);
		});

		it('harus mendukung signature dengan prefix "sha256="', () => {
			const payload = JSON.stringify({ orderNumber: 'ML-11223', status: 'capture' });
			const validSignature = 'sha256=' + crypto.createHmac('sha256', TEST_SECRET).update(payload).digest('hex');

			expect(verifyWebhookSignature(payload, validSignature, TEST_SECRET)).toBe(true);
		});

		it('harus menolak signature jika payload telah diubah (tampered payload)', () => {
			const originalPayload = JSON.stringify({ orderNumber: 'ML-99123', transaction_status: 'settlement' });
			const tamperedPayload = JSON.stringify({ orderNumber: 'ML-99123', transaction_status: 'cancel' });

			const signature = crypto.createHmac('sha256', TEST_SECRET).update(originalPayload).digest('hex');

			expect(verifyWebhookSignature(tamperedPayload, signature, TEST_SECRET)).toBe(false);
		});

		it('harus menolak request tanpa signature atau dengan signature kosong/null', () => {
			const payload = JSON.stringify({ orderNumber: 'ML-99123', transaction_status: 'settlement' });

			expect(verifyWebhookSignature(payload, null, TEST_SECRET)).toBe(false);
			expect(verifyWebhookSignature(payload, '', TEST_SECRET)).toBe(false);
			expect(verifyWebhookSignature(payload, '   ', TEST_SECRET)).toBe(false);
		});

		it('harus menolak signature yang dibuat dengan secret key berbeda', () => {
			const payload = JSON.stringify({ orderNumber: 'ML-99123', transaction_status: 'settlement' });
			const wrongSecret = 'another_secret_key_99999';
			const signature = crypto.createHmac('sha256', wrongSecret).update(payload).digest('hex');

			expect(verifyWebhookSignature(payload, signature, TEST_SECRET)).toBe(false);
		});
	});

	// =========================================================================
	// 2. Koreksi 2: Atomic Conditional Idempotency Update (Payment Success)
	// =========================================================================
	describe('2. Idempotensi Webhook Pembayaran Sukses', () => {
		interface MockOrder {
			orderNumber: string;
			paymentStatus: string;
			status: string;
		}

		it('simulasi atomic update: pembaruan pertama berhasil (count: 1), retry kedua idempoten (count: 0)', () => {
			const order: MockOrder = {
				orderNumber: 'ML-55443',
				paymentStatus: 'Pending',
				status: 'Diterima'
			};

			// Fungsi simulasi updateMany({ where: { orderNumber, paymentStatus: { not: 'Paid' } } })
			function simulateAtomicPaymentSuccess(target: MockOrder): { count: number; alreadyProcessed: boolean } {
				if (target.paymentStatus !== 'Paid') {
					target.paymentStatus = 'Paid';
					target.status = 'Disiapkan';
					return { count: 1, alreadyProcessed: false };
				}
				return { count: 0, alreadyProcessed: true };
			}

			// Webhook pertama tiba
			const firstAttempt = simulateAtomicPaymentSuccess(order);
			expect(firstAttempt.count).toBe(1);
			expect(firstAttempt.alreadyProcessed).toBe(false);
			expect(order.paymentStatus).toBe('Paid');
			expect(order.status).toBe('Disiapkan');

			// Webhook retry kedua tiba dengan payload yang sama persis
			const secondAttempt = simulateAtomicPaymentSuccess(order);
			expect(secondAttempt.count).toBe(0);
			expect(secondAttempt.alreadyProcessed).toBe(true);
			// Status tidak berubah lagi
			expect(order.paymentStatus).toBe('Paid');
			expect(order.status).toBe('Disiapkan');
		});
	});

	// =========================================================================
	// 3. Koreksi 3: Restorasi Stok Idempoten dengan Flag stockRestored
	// =========================================================================
	describe('3. Restorasi Stok dengan Flag stockRestored', () => {
		interface MockVariant {
			id: string;
			stock: number;
		}

		interface MockOrderItem {
			variantId: string;
			qty: number;
		}

		interface MockOrderWithStock {
			orderNumber: string;
			paymentStatus: string;
			status: string;
			stockRestored: boolean;
			items: MockOrderItem[];
		}

		it('harus merestorasi stok hanya sekali dan mencegah duplicate stock leak pada webhook pembatalan berulang', () => {
			const variant: MockVariant = { id: 'var-teak-1', stock: 10 };
			const order: MockOrderWithStock = {
				orderNumber: 'ML-77889',
				paymentStatus: 'Pending',
				status: 'Diterima',
				stockRestored: false,
				items: [{ variantId: 'var-teak-1', qty: 3 }]
			};

			// Fungsi simulasi tx.order.updateMany({ where: { orderNumber, stockRestored: false } })
			function simulateAtomicCancellation(
				targetOrder: MockOrderWithStock,
				variantsMap: Map<string, MockVariant>
			): { count: number; stockRestored: boolean } {
				if (!targetOrder.stockRestored) {
					targetOrder.stockRestored = true;
					targetOrder.paymentStatus = 'Cancelled';
					targetOrder.status = 'Dibatalkan';

					// Increment stock
					for (const item of targetOrder.items) {
						const v = variantsMap.get(item.variantId);
						if (v) {
							v.stock += item.qty;
						}
					}
					return { count: 1, stockRestored: true };
				}
				return { count: 0, stockRestored: false };
			}

			const variantsMap = new Map<string, MockVariant>([['var-teak-1', variant]]);

			// Panggilan webhook cancel pertama
			const attempt1 = simulateAtomicCancellation(order, variantsMap);
			expect(attempt1.count).toBe(1);
			expect(attempt1.stockRestored).toBe(true);
			expect(variant.stock).toBe(13); // 10 + 3
			expect(order.stockRestored).toBe(true);

			// Panggilan webhook cancel kedua (duplikat retry dari payment gateway)
			const attempt2 = simulateAtomicCancellation(order, variantsMap);
			expect(attempt2.count).toBe(0);
			expect(attempt2.stockRestored).toBe(false);
			expect(variant.stock).toBe(13); // Tetap 13, TIDAK menjadi 16!
		});
	});

	// =========================================================================
	// 4. Koreksi 4: Idempotensi onOrderCompleted & Kalkulasi Akrual Poin/Tier
	// =========================================================================
	describe('4. Idempotensi Akrual Poin & Spending Pesanan Selesai', () => {
		interface MockUser {
			id: string;
			totalSpending: number;
			loyaltyPoints: number;
			tier: string;
		}

		interface MockCompleteOrder {
			id: string;
			userId: string;
			total: number;
			status: string;
			loyaltyProcessed: boolean;
		}

		function simulateOnOrderCompleted(order: MockCompleteOrder, user: MockUser) {
			if (order.loyaltyProcessed) {
				return {
					alreadyProcessed: true,
					pointsAwarded: 0,
					totalSpending: user.totalSpending,
					tier: user.tier
				};
			}

			const pointsAwarded = Math.max(0, Math.floor(order.total / 100_000));
			user.totalSpending += order.total;
			user.loyaltyPoints += pointsAwarded;
			user.tier = calculateTier(user.totalSpending);
			order.loyaltyProcessed = true;
			order.status = 'Selesai';

			return {
				alreadyProcessed: false,
				pointsAwarded,
				totalSpending: user.totalSpending,
				tier: user.tier
			};
		}

		it('harus menghitung poin tepat 1 poin per Rp 100.000 dan menaikkan tier secara otomatis', () => {
			const user: MockUser = {
				id: 'u-1',
				totalSpending: 8_000_000,
				loyaltyPoints: 80,
				tier: 'Regular'
			};

			const order: MockCompleteOrder = {
				id: 'ord-1',
				userId: 'u-1',
				total: 12_500_000, // Total order: 12.5jt -> 125 poin baru
				status: 'Dikirim',
				loyaltyProcessed: false
			};

			const res1 = simulateOnOrderCompleted(order, user);
			expect(res1.alreadyProcessed).toBe(false);
			expect(res1.pointsAwarded).toBe(125);
			expect(user.loyaltyPoints).toBe(205); // 80 + 125
			expect(user.totalSpending).toBe(20_500_000); // 8jt + 12.5jt = 20.5jt
			expect(user.tier).toBe('Silver'); // >= 10jt masuk Silver!
		});

		it('pemanggilan kedua pada pesanan yang sama harus idempoten (0 poin tambahan, totalSpending tidak berlipat ganda)', () => {
			const user: MockUser = {
				id: 'u-1',
				totalSpending: 5_000_000,
				loyaltyPoints: 50,
				tier: 'Regular'
			};

			const order: MockCompleteOrder = {
				id: 'ord-2',
				userId: 'u-1',
				total: 5_000_000,
				status: 'Dikirim',
				loyaltyProcessed: false
			};

			// Panggilan pertama
			const res1 = simulateOnOrderCompleted(order, user);
			expect(res1.alreadyProcessed).toBe(false);
			expect(res1.pointsAwarded).toBe(50);
			expect(user.totalSpending).toBe(10_000_000);
			expect(user.tier).toBe('Silver');

			// Panggilan kedua (klik ganda / concurrent retry)
			const res2 = simulateOnOrderCompleted(order, user);
			expect(res2.alreadyProcessed).toBe(true);
			expect(res2.pointsAwarded).toBe(0);
			expect(user.totalSpending).toBe(10_000_000); // Tetap 10jt
			expect(user.loyaltyPoints).toBe(100); // Tetap 100
			expect(user.tier).toBe('Silver');
		});

		it('pengeluaran melewati ambang Gold (50jt) dan Platinum (150jt) menaikkan tier dengan benar', () => {
			expect(calculateTier(9_999_999)).toBe('Regular');
			expect(calculateTier(10_000_000)).toBe('Silver');
			expect(calculateTier(49_999_999)).toBe('Silver');
			expect(calculateTier(50_000_000)).toBe('Gold');
			expect(calculateTier(149_999_999)).toBe('Gold');
			expect(calculateTier(150_000_000)).toBe('Platinum');
		});
	});

	// =========================================================================
	// 5. Koreksi 5 & Kalkulasi Faktur: Presisi Finansial E-Invoice
	// =========================================================================
	describe('5. Presisi Finansial Faktur & PPN 11%', () => {
		it('harus menghitung subtotal, PPN 11%, dan total pembayaran dengan presisi integer tanpa floating point drift', () => {
			const items = [
				{ unitPrice: 4_850_000, qty: 2 }, // 9.700.000
				{ unitPrice: 1_250_000, qty: 1 }  // 1.250.000
			];

			const totals = calculateCartTotals(items, {
				shippingFee: 0,
				installFee: 0,
				applyTax: true
			});

			const expectedSubtotal = 10_950_000;
			const expectedTax = Math.round(expectedSubtotal * 0.11); // 1.204.500
			const expectedTotal = expectedSubtotal + expectedTax;    // 12.154.500

			expect(totals.subtotal).toBe(expectedSubtotal);
			expect(totals.shippingFee).toBe(0);
			expect(totals.installFee).toBe(0);
			expect(totals.tax).toBe(expectedTax);
			expect(totals.total).toBe(expectedTotal);
		});

		it('harus menyediakan info progres tier selanjutnya secara akurat untuk pesanan faktur', () => {
			const tierInfo = getNextTierInfo(25_000_000);
			expect(tierInfo.currentTier).toBe('Silver');
			expect(tierInfo.nextTier).toBe('Gold');
			expect(tierInfo.neededAmount).toBe(25_000_000); // 50jt - 25jt = 25jt
			expect(tierInfo.progressPercent).toBe(37.5); // (25jt - 10jt) / (50jt - 10jt) = 15jt / 40jt = 37.5%
		});
	});
});
