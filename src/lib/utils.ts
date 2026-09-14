import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, E = HTMLElement> = T & {
	ref?: E | null;
};

export type WithoutChild<T> = Omit<T, "child">;
export type WithoutChildren<T> = Omit<T, "children">;
export type WithoutChildrenOrChild<T> = Omit<T, "children" | "child">;

/**
 * Formats a numeric price to Indonesian Rupiah (e.g., 4850000 -> "Rp 4.850.000")
 */
export function formatRupiah(amount: number): string {
	if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount).replace(/\s+/g, " ");
}

/**
 * Formats a date string or Date object to Indonesian localized format
 */
export function formatDateId(date: string | Date): string {
	try {
		const d = typeof date === "string" ? new Date(date) : date;
		return new Intl.DateTimeFormat("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		}).format(d);
	} catch {
		return String(date);
	}
}
