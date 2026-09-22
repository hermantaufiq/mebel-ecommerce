import { prisma } from '$lib/server/prisma';
import { calculateTier } from '$lib/server/tier-config';

export interface OrderCompletedResult {
	alreadyProcessed: boolean;
	pointsAwarded: number;
	totalSpending: number;
	tier: string;
}

/**
 * Handles all loyalty points, total spending accumulation, and tier upgrades
 * when an order transitions to status 'Selesai'.
 * 
 * IDEMPOTENT: If order.loyaltyProcessed is already true, this function exits cleanly
 * without double-awarding points or double-accumulating spending.
 */
export async function onOrderCompleted(orderId: string): Promise<OrderCompletedResult> {
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: {
			id: true,
			userId: true,
			total: true,
			status: true,
			loyaltyProcessed: true
		}
	});

	if (!order) {
		throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
	}

	// 1. Idempotency Check (Koreksi 1): Do not reprocess if already done
	if (order.loyaltyProcessed) {
		const existingUser = await prisma.user.findUnique({
			where: { id: order.userId },
			select: { totalSpending: true, tier: true }
		});
		return {
			alreadyProcessed: true,
			pointsAwarded: 0,
			totalSpending: existingUser?.totalSpending ?? 0,
			tier: existingUser?.tier ?? 'Regular'
		};
	}

	// 2. Calculate newly earned loyalty points (1 point per Rp 100,000)
	const newPoints = Math.max(0, Math.floor(order.total / 100_000));

	// 3. Atomically update Order (loyaltyProcessed: true) and User (spending, points, tier)
	return prisma.$transaction(async (tx) => {
		// Double check within transaction with lock
		const freshOrder = await tx.order.findUnique({
			where: { id: order.id },
			select: { loyaltyProcessed: true, userId: true, total: true }
		});

		if (!freshOrder || freshOrder.loyaltyProcessed) {
			const u = await tx.user.findUnique({
				where: { id: order.userId },
				select: { totalSpending: true, tier: true }
			});
			return {
				alreadyProcessed: true,
				pointsAwarded: 0,
				totalSpending: u?.totalSpending ?? 0,
				tier: u?.tier ?? 'Regular'
			};
		}

		const user = await tx.user.findUnique({
			where: { id: order.userId },
			select: { id: true, totalSpending: true, loyaltyPoints: true, tier: true }
		});

		if (!user) {
			throw new Error(`User pemilik pesanan tidak ditemukan.`);
		}

		const newTotalSpending = user.totalSpending + order.total;
		const newLoyaltyPoints = user.loyaltyPoints + newPoints;
		const updatedTier = calculateTier(newTotalSpending);

		// Mark order as completed and loyalty processed
		await tx.order.update({
			where: { id: order.id },
			data: {
				status: 'Selesai',
				loyaltyProcessed: true
			}
		});

		// Update user spending, points, and tier
		const updatedUser = await tx.user.update({
			where: { id: user.id },
			data: {
				totalSpending: newTotalSpending,
				loyaltyPoints: newLoyaltyPoints,
				tier: updatedTier
			},
			select: {
				totalSpending: true,
				loyaltyPoints: true,
				tier: true
			}
		});

		return {
			alreadyProcessed: false,
			pointsAwarded: newPoints,
			totalSpending: updatedUser.totalSpending,
			tier: updatedUser.tier
		};
	});
}
