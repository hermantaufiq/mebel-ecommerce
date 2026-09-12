import { describe, it, expect } from "vitest";
import { calculateCartTotals } from "../cart-calculations";

describe("calculateCartTotals", () => {
  it("harus mengembalikan semua 0 saat cart kosong", () => {
    const totals = calculateCartTotals([]);
    expect(totals).toEqual({
      subtotal: 0,
      shippingFee: 0,
      installFee: 0,
      discount: 0,
      tax: 0,
      total: 0,
    });
  });

  it("harus menghitung subtotal dengan benar untuk 1 item qty 2 dengan variant priceOffset", () => {
    // Base price: Rp 4.850.000 + priceOffset: Rp 250.000 = Rp 5.100.000
    // Qty: 2 -> Subtotal = Rp 10.200.000
    const items = [
      {
        unitPrice: 4850000 + 250000,
        qty: 2,
      },
    ];

    const totals = calculateCartTotals(items);
    expect(totals.subtotal).toBe(10200000);
    expect(totals.total).toBe(10200000);
  });

  it("harus menjumlahkan multiple items dengan varian berbeda secara presisi", () => {
    const items = [
      {
        unitPrice: 4850000, // Astra Armchair (Jati Natural)
        qty: 1,
      },
      {
        unitPrice: 4850000 + 250000, // Astra Armchair (Jati Walnut)
        qty: 2,
      },
      {
        unitPrice: 14500000, // Komorebi Curved Sofa
        qty: 1,
      },
    ];

    // Subtotal: 4.850.000 + (5.100.000 * 2) + 14.500.000 = 29.550.000
    const totals = calculateCartTotals(items, {
      shippingFee: 0,
      installFee: 0,
      discount: 500000,
    });

    expect(totals.subtotal).toBe(29550000);
    expect(totals.discount).toBe(500000);
    expect(totals.total).toBe(29050000);
  });

  it("harus menghitung pajak PPN 11% jika taxRate ditentukan", () => {
    const items = [{ unitPrice: 1000000, qty: 1 }];
    const totals = calculateCartTotals(items, { taxRate: 0.11 });

    expect(totals.subtotal).toBe(1000000);
    expect(totals.tax).toBe(110000);
    expect(totals.total).toBe(1110000);
  });
});
