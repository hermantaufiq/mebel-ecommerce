export const TIER_THRESHOLDS = {
	Regular: 0,
	Silver: 10_000_000,
	Gold: 50_000_000,
	Platinum: 150_000_000
} as const;

export type TierName = keyof typeof TIER_THRESHOLDS;

export const TIER_ORDER: Record<string, number> = {
	Regular: 0,
	Silver: 1,
	Gold: 2,
	Platinum: 3
};

export const TIER_METADATA: Record<
	TierName,
	{
		label: string;
		badgeBg: string;
		badgeText: string;
		border: string;
		perks: string[];
	}
> = {
	Regular: {
		label: 'Maison Regular',
		badgeBg: 'bg-stone-100 text-stone-800',
		badgeText: 'text-stone-700',
		border: 'border-stone-300',
		perks: ['Katalog eksklusif', 'Gratis ongkir Jabodetabek', '1 Poin per Rp 100rb']
	},
	Silver: {
		label: 'Maison Silver',
		badgeBg: 'bg-slate-100 text-slate-800',
		badgeText: 'text-slate-800',
		border: 'border-slate-300',
		perks: ['Voucher potongan Rp 1.5jt', 'Konsultasi desain interior', 'Gratis ongkir luar Jabodetabek']
	},
	Gold: {
		label: 'Maison Gold',
		badgeBg: 'bg-amber-100 text-amber-900',
		badgeText: 'text-amber-900',
		border: 'border-amber-300',
		perks: ['Extended Warranty +1 Tahun', 'Prioritas pengiriman atelier', 'Undangan private viewing']
	},
	Platinum: {
		label: 'Maison Platinum',
		badgeBg: 'bg-stone-900 text-amber-300',
		badgeText: 'text-stone-900',
		border: 'border-amber-400',
		perks: ['Custom artisan bespoke order', 'Dedicated personal curator', 'Akses seluruh reward tanpa batas tier']
	}
};

export function calculateTier(totalSpending: number): TierName {
	if (totalSpending >= TIER_THRESHOLDS.Platinum) return 'Platinum';
	if (totalSpending >= TIER_THRESHOLDS.Gold) return 'Gold';
	if (totalSpending >= TIER_THRESHOLDS.Silver) return 'Silver';
	return 'Regular';
}

export function isTierEligible(userTier: string, minTier: string): boolean {
	const userRank = TIER_ORDER[userTier] ?? 0;
	const requiredRank = TIER_ORDER[minTier] ?? 0;
	return userRank >= requiredRank;
}

export interface NextTierInfo {
	currentTier: TierName;
	nextTier: TierName | null;
	totalSpending: number;
	neededAmount: number;
	progressPercent: number;
	currentThreshold: number;
	nextThreshold: number | null;
}

export function getNextTierInfo(totalSpending: number): NextTierInfo {
	const currentTier = calculateTier(totalSpending);

	if (totalSpending < TIER_THRESHOLDS.Silver) {
		const needed = TIER_THRESHOLDS.Silver - totalSpending;
		const progress = Math.min(100, Math.max(0, (totalSpending / TIER_THRESHOLDS.Silver) * 100));
		return {
			currentTier,
			nextTier: 'Silver',
			totalSpending,
			neededAmount: needed,
			progressPercent: progress,
			currentThreshold: 0,
			nextThreshold: TIER_THRESHOLDS.Silver
		};
	}

	if (totalSpending < TIER_THRESHOLDS.Gold) {
		const range = TIER_THRESHOLDS.Gold - TIER_THRESHOLDS.Silver;
		const current = totalSpending - TIER_THRESHOLDS.Silver;
		const needed = TIER_THRESHOLDS.Gold - totalSpending;
		const progress = Math.min(100, Math.max(0, (current / range) * 100));
		return {
			currentTier,
			nextTier: 'Gold',
			totalSpending,
			neededAmount: needed,
			progressPercent: progress,
			currentThreshold: TIER_THRESHOLDS.Silver,
			nextThreshold: TIER_THRESHOLDS.Gold
		};
	}

	if (totalSpending < TIER_THRESHOLDS.Platinum) {
		const range = TIER_THRESHOLDS.Platinum - TIER_THRESHOLDS.Gold;
		const current = totalSpending - TIER_THRESHOLDS.Gold;
		const needed = TIER_THRESHOLDS.Platinum - totalSpending;
		const progress = Math.min(100, Math.max(0, (current / range) * 100));
		return {
			currentTier,
			nextTier: 'Platinum',
			totalSpending,
			neededAmount: needed,
			progressPercent: progress,
			currentThreshold: TIER_THRESHOLDS.Gold,
			nextThreshold: TIER_THRESHOLDS.Platinum
		};
	}

	return {
		currentTier: 'Platinum',
		nextTier: null,
		totalSpending,
		neededAmount: 0,
		progressPercent: 100,
		currentThreshold: TIER_THRESHOLDS.Platinum,
		nextThreshold: null
	};
}
