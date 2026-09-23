import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	const orderNumber = params.orderNumber;
	if (!orderNumber) {
		throw error(404, 'Nomor pesanan tidak valid');
	}

	const order = await prisma.order.findUnique({
		where: { orderNumber },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true
				}
			},
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
		throw error(404, 'Faktur pesanan tidak ditemukan');
	}

	// Ownership protection: only the owner of the order may view this official e-invoice
	const user = locals.user;
	if (!user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(`/checkout/invoice/${orderNumber}`)}`);
	}

	if (order.userId !== user.id) {
		throw error(403, 'Anda tidak memiliki hak akses untuk melihat faktur pesanan ini.');
	}

	return {
		order
	};
};
