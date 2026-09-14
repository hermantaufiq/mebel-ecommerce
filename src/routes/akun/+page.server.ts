import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { getSessionUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	let user = await getSessionUser(cookies);

	if (!user) {
		// Fallback to default VIP user if existing in database
		user = await prisma.user.findFirst({
			where: { email: 'dian.sastro@example.com' },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				tier: true,
				loyaltyPoints: true,
				createdAt: true
			}
		});
	}

	if (!user) {
		throw redirect(303, '/login?redirect=/akun');
	}

	// Fetch all orders for this user
	const orders = await prisma.order.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
		include: {
			items: {
				include: {
					product: {
						include: {
							images: true
						}
					}
				}
			}
		}
	});

	return {
		user,
		orders
	};
};
