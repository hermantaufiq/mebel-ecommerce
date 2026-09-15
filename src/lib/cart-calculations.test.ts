import { describe, it, expect } from 'vitest';
import { calculateCartTotals, type CalculableCartItem } from './cart-calculations';

describe('calculateCartTotals pure function', () => {
	it('returns zero totals when cart is empty', () => {
		const result = calculateCartTotals([]);
		expect(result).toEqual({
			subtotal: 0,
			shippingFee: 0,
			installFee: 0,
			discount: 0,
			tax: 0,
			total: 0
		});
	});

	it('correctly calculates subtotal for a single item with quantity', () => {
		const items: CalculableCartItem[] = [
			{ unitPrice: 7500000, qty: 2 }
		];
		const result = calculateCartTotals(items);
		expect(result.subtotal).toBe(15000000);
		expect(result.total).toBe(15000000);
	});

	it('calculates multiple items with different quantities and prices', () => {
		const items: CalculableCartItem[] = [
			{ unitPrice: 5000000, qty: 1 }, // 5,000,000
			{ unitPrice: 3500000, qty: 3 }, // 10,500,000
			{ unitPrice: 1200000, qty: 2 }  // 2,400,000
		];
		const result = calculateCartTotals(items);
		expect(result.subtotal).toBe(17900000);
		expect(result.total).toBe(17900000);
	});

	it('adds shipping fee and installation fee to total', () => {
		const items: CalculableCartItem[] = [
			{ unitPrice: 10000000, qty: 1 }
		];
		const result = calculateCartTotals(items, {
			shippingFee: 250000,
			installFee: 150000
		});
		expect(result.subtotal).toBe(10000000);
		expect(result.shippingFee).toBe(250000);
		expect(result.installFee).toBe(150000);
		expect(result.total).toBe(10400000);
	});

	it('calculates 11% PPN tax when applyTax is true', () => {
		const items: CalculableCartItem[] = [
			{ unitPrice: 10000000, qty: 1 }
		];
		// taxableBase = 10,000,000 + shipping (0) - discount (0) = 10,000,000
		// tax = 10,000,000 * 0.11 = 1,100,000
		// total = 10,000,000 + 1,100,000 = 11,100,000
		const result = calculateCartTotals(items, { applyTax: true });
		expect(result.subtotal).toBe(10000000);
		expect(result.tax).toBe(1100000);
		expect(result.total).toBe(11100000);
	});

	it('applies discount and does not allow negative totals', () => {
		const items: CalculableCartItem[] = [
			{ unitPrice: 2000000, qty: 1 }
		];
		const resultWithDiscount = calculateCartTotals(items, { discount: 500000 });
		expect(resultWithDiscount.subtotal).toBe(2000000);
		expect(resultWithDiscount.discount).toBe(500000);
		expect(resultWithDiscount.total).toBe(1500000);

		// Oversized discount should clamp total to 0
		const resultOverDiscount = calculateCartTotals(items, { discount: 5000000 });
		expect(resultOverDiscount.total).toBe(0);
	});
});
