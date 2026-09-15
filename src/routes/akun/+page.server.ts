import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

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

	return {
		user,
		orders,
		addresses
	};
};
