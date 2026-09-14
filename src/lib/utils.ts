import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "Rp 0";
  }
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

export function formatSimulasiCicilan(price: number, months: number = 12): string {
  const monthly = Math.round(price / months);
  return `Cicilan 0% mulai ${formatRupiah(monthly)}/bln (${months}x)`;
}

export function formatDateId(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}
