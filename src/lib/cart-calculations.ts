export interface CalculableCartItem {
  unitPrice: number; // Final price per unit, including variant priceOffset
  qty: number;
}

export interface CartCalculationOptions {
  shippingFee?: number;
  installFee?: number;
  discount?: number;
  taxRate?: number; // e.g., 0 for no tax or 0.11 for 11% PPN
  applyTax?: boolean; // Convenience flag: if true and taxRate not explicitly set, uses 0.11 (PPN 11%)
}

export interface CartTotals {
  subtotal: number;
  shippingFee: number;
  installFee: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Pure calculation function for cart, checkout, and order confirmation totals.
 * Single source of truth across the entire platform.
 */
export function calculateCartTotals(
  items: CalculableCartItem[] = [],
  options: CartCalculationOptions = {}
): CartTotals {
  const {
    shippingFee = 0,
    installFee = 0,
    discount = 0,
    applyTax = false,
  } = options;

  // If taxRate is provided, use it; otherwise, if applyTax is true, default to 11% (0.11)
  const effectiveTaxRate =
    options.taxRate !== undefined ? options.taxRate : applyTax ? 0.11 : 0;

  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      shippingFee: 0,
      installFee: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
  }

  // Calculate subtotal = sum(unitPrice * qty)
  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.unitPrice === "number" ? item.unitPrice : 0;
    const qty = typeof item.qty === "number" && item.qty > 0 ? item.qty : 1;
    return sum + price * qty;
  }, 0);

  // Calculate tax if applicable (subtotal + shippingFee)
  const taxableBase = Math.max(0, subtotal + shippingFee - discount);
  const tax = effectiveTaxRate > 0 ? Math.round(taxableBase * effectiveTaxRate) : 0;

  // Final total
  const total = Math.max(
    0,
    subtotal + shippingFee + installFee + tax - discount
  );

  return {
    subtotal: Math.round(subtotal),
    shippingFee: Math.round(shippingFee),
    installFee: Math.round(installFee),
    discount: Math.round(discount),
    tax: Math.round(tax),
    total: Math.round(total),
  };
}
