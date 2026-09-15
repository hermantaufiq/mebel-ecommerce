import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url, locals }) => {
	const orderNumber = url.searchParams.get('order');
	if (!orderNumber) {
		throw error(404, 'Nomor pesanan tidak ditemukan');
	}

	const order = await prisma.order.findUnique({
		where: { orderNumber },
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

	if (!order) {
		throw error(404, 'Pesanan tidak ditemukan');
	}

	// Ownership protection: only the order owner can view their confirmation
	const user = locals.user;
	if (!user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(`/checkout/konfirmasi?order=${orderNumber}`)}`);
	}

	if (order.userId !== user.id) {
		throw error(403, 'Anda tidak memiliki akses untuk melihat pesanan ini.');
	}

	return {
		order
	};
};
