export function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "Rp 0";
  }
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

export const formatRupiah = formatCurrency;
