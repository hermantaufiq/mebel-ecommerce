import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getSessionUser } from '$lib/server/auth';
import { Prisma } from '@prisma/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			return json({ success: true, guest: true });
		}

		const { productId } = await request.json();
		if (!productId) {
			return json({ error: 'productId wajib diisi' }, { status: 400 });
		}

		// Check if already wishlisted for this user
		const existing = await prisma.wishlistItem.findUnique({
			where: {
				userId_productId: {
					userId: user.id,
					productId
				}
			}
		});

		if (existing) {
			// Use deleteMany so concurrent delete does not throw
			await prisma.wishlistItem.deleteMany({
				where: {
					userId: user.id,
					productId
				}
			});
			return json({ success: true, wishlisted: false });
		} else {
			// Create with P2002 unique constraint race condition protection
			try {
				await prisma.wishlistItem.create({
					data: {
						userId: user.id,
						productId
					}
				});
				return json({ success: true, wishlisted: true });
			} catch (err) {
				if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
					// Another concurrent request already created it — treat as idempotent success
					return json({ success: true, wishlisted: true });
				}
				throw err;
			}
		}
	} catch (error: any) {
		console.error('Wishlist toggle error:', error);
		return json({ error: 'Gagal memperbarui daftar keinginan' }, { status: 500 });
	}
};
