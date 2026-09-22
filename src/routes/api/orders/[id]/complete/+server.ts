import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { onOrderCompleted } from '$lib/server/loyalty';

export const POST: RequestHandler = async ({ params, locals }) => {
	// 1. Authenticate user
	const session = locals.user;
	if (!session) {
		return json({ error: 'Silakan masuk ke akun Anda terlebih dahulu' }, { status: 401 });
	}

	const orderId = params.id;
	if (!orderId) {
		return json({ error: 'ID pesanan tidak valid' }, { status: 400 });
	}

	// 2. Fetch order and validate ownership (Koreksi 3: return 404 if not owner)
	const order = await prisma.order.findUnique({
		where: { id: orderId }
	});

	if (!order || order.userId !== session.id) {
		return json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
	}

	// 3. Validate legitimate status transition (Koreksi 3: only 'Dikirim' can be completed)
	if (order.status !== 'Dikirim') {
		return json({ error: 'Pesanan belum bisa dikonfirmasi selesai' }, { status: 400 });
	}

	try {
		// 4. Trigger centralized idempotent completion & loyalty accrual
		const result = await onOrderCompleted(order.id);

		return json({
			success: true,
			message: 'Pesanan telah berhasil dikonfirmasi selesai! Poin loyalitas telah ditambahkan ke akun Anda.',
			result
		});
	} catch (err: any) {
		console.error('Error completing order:', err);
		return json({ error: err.message || 'Gagal menyelesaikan pesanan' }, { status: 500 });
	}
};
