import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url }) => {
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

	return {
		order
	};
};
