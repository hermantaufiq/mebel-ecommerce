import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { isTierEligible } from '$lib/server/tier-config';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Silakan masuk ke akun Anda terlebih dahulu' }, { status: 401 });
	}

	try {
		const { rewardId } = await request.json();
		if (!rewardId) {
			return json({ error: 'ID reward wajib disertakan' }, { status: 400 });
		}

		// 1. Fetch reward definition
		const reward = await prisma.reward.findUnique({
			where: { id: rewardId }
		});

		if (!reward || !reward.isActive) {
			return json({ error: 'Reward tidak ditemukan atau sudah tidak aktif' }, { status: 404 });
		}

		// 2. Validate tier eligibility
		if (!isTierEligible(user.tier, reward.minTier)) {
			return json(
				{ error: `Reward ini memerlukan keanggotaan minimum ${reward.minTier}.` },
				{ status: 403 }
			);
		}

		// 3. Early check to provide friendly error message if points clearly insufficient
		if (user.loyaltyPoints < reward.pointsCost) {
			const shortage = reward.pointsCost - user.loyaltyPoints;
			return json(
				{
					error: `Poin Anda kurang ${shortage.toLocaleString('id-ID')} lagi untuk menukar reward ini.`
				},
				{ status: 400 }
			);
		}

		// 4. Conditional Atomic Transaction (Koreksi 2: Anti double-spend / race condition)
		const redemption = await prisma.$transaction(async (tx) => {
			// A. Atomic points deduction: only succeeds if user's points >= reward.pointsCost at the instant of execution
			const userUpdate = await tx.user.updateMany({
				where: {
					id: user.id,
					loyaltyPoints: { gte: reward.pointsCost }
				},
				data: {
					loyaltyPoints: { decrement: reward.pointsCost }
				}
			});

			if (userUpdate.count === 0) {
				throw new Error('Poin tidak cukup');
			}

			// B. Atomic stock decrement if reward stock is finite
			if (reward.stock !== null) {
				const stockUpdate = await tx.reward.updateMany({
					where: { id: reward.id, stock: { gt: 0 } },
					data: { stock: { decrement: 1 } }
				});

				if (stockUpdate.count === 0) {
					throw new Error('Stok reward habis');
				}
			}

			// C. Generate unique voucher code for voucher-type rewards
			let voucherCode: string | null = null;
			if (reward.category === 'voucher') {
				const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
				voucherCode = `ML-VCR-${randomStr}`;
			}

			// D. Calculate expiration date if validityDays is set
			let expiresAt: Date | null = null;
			if (reward.validityDays) {
				expiresAt = new Date(Date.now() + reward.validityDays * 86400000);
			}

			// E. Create RewardRedemption record
			return tx.rewardRedemption.create({
				data: {
					userId: user.id,
					rewardId: reward.id,
					pointsSpent: reward.pointsCost,
					status: 'Aktif',
					voucherCode,
					expiresAt
				},
				include: {
					reward: true
				}
			});
		});

		// Fetch updated user stats for frontend instant update
		const freshUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { loyaltyPoints: true, tier: true, totalSpending: true }
		});

		return json({
			success: true,
			message: `Berhasil menukarkan reward "${reward.name}"!`,
			redemption,
			updatedUser: freshUser
		});
	} catch (err: any) {
		console.error('Error redeeming reward:', err);
		return json({ error: err.message || 'Gagal menukarkan reward' }, { status: 400 });
	}
};
