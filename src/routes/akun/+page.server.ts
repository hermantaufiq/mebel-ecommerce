import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { getNextTierInfo } from '$lib/server/tier-config';

export const load: PageServerLoad = async ({ locals }) => {
	// Strict auth: no bypass, no fallback to demo account
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login?redirect=/akun');
	}

	// Fetch orders belonging ONLY to authenticated user
	const orders = await prisma.order.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
		include: {
			items: {
				include: {
					product: {
						include: {
							images: true,
							variants: true
						}
					}
				}
			}
		}
	});

	// Fetch saved addresses for this user
	const addresses = await prisma.address.findMany({
		where: { userId: user.id },
		orderBy: { isDefault: 'desc' }
	});

	// Fetch all active rewards for catalog tab
	const rewards = await prisma.reward.findMany({
		where: { isActive: true },
		orderBy: [{ minTier: 'asc' }, { pointsCost: 'asc' }]
	});

	// Fetch user's redemption history
	const redemptions = await prisma.rewardRedemption.findMany({
		where: { userId: user.id },
		orderBy: { redeemedAt: 'desc' },
		include: { reward: true }
	});

	// Get fresh user data (includes latest totalSpending, tier, loyaltyPoints)
	const freshUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			totalSpending: true,
			tier: true,
			loyaltyPoints: true,
			createdAt: true
		}
	});

	// Calculate tier progress
	const tierInfo = getNextTierInfo(freshUser?.totalSpending ?? 0);

	return {
		user: freshUser ?? user,
		orders,
		addresses,
		rewards,
		redemptions,
		tierInfo
	};
};
