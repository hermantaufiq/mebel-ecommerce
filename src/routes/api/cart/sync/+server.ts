import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getSessionUser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			// Guest user - mutation is purely client-side in localStorage
			return json({ success: true, guest: true });
		}

		const body = await request.json();
		const { guestItems, mutations } = body;

		// 1. One-time bulk merge of guest cart items (e.g., during login transition)
		if (guestItems && Array.isArray(guestItems)) {
			const existingCartItems = await prisma.cartItem.findMany({
				where: { userId: user.id }
			});

			for (const gItem of guestItems) {
				const pId = gItem.productId || gItem.id;
				const vId = gItem.variantId || null;
				const gQty = Math.max(1, Math.floor(Number(gItem.qty) || 1));

				const product = await prisma.product.findUnique({
					where: { id: pId },
					select: { id: true }
				});
				if (!product) continue;

				let maxStock = 99;
				if (vId) {
					const variant = await prisma.productVariant.findUnique({
						where: { id: vId },
						select: { stock: true }
					});
					if (!variant) continue;
					maxStock = variant.stock;
				}

				const existing = existingCartItems.find(
					(item) => item.productId === pId && (item.variantId ?? null) === vId
				);

				if (existing) {
					const newQty = Math.min(existing.qty + gQty, maxStock);
					await prisma.cartItem.update({
						where: { id: existing.id },
						data: { qty: newQty }
					});
				} else {
					await prisma.cartItem.create({
						data: {
							userId: user.id,
							productId: pId,
							variantId: vId,
							qty: Math.min(gQty, maxStock)
						}
					});
				}
			}

			return json({ success: true, merged: true });
		}

		// Helper to apply single mutation idempotently
		const applyMutation = async (mut: any) => {
			const { action, productId, variantId = null, qty } = mut;
			if (action === 'clear') {
				await prisma.cartItem.deleteMany({
					where: { userId: user.id }
				});
				return { success: true, action: 'clear' };
			}

			if (!productId) {
				return { error: 'productId wajib diisi untuk mutasi item' };
			}

			const targetVariantId = variantId || null;

			if (action === 'remove') {
				await prisma.cartItem.deleteMany({
					where: {
						userId: user.id,
						productId,
						variantId: targetVariantId
					}
				});
				return { success: true, action: 'remove' };
			}

			// Verify product & variant stock limits
			const product = await prisma.product.findUnique({
				where: { id: productId },
				select: { id: true }
			});
			if (!product) {
				return { error: 'Produk tidak ditemukan' };
			}

			let maxStock = 99;
			if (targetVariantId) {
				const variant = await prisma.productVariant.findUnique({
					where: { id: targetVariantId },
					select: { stock: true, productId: true }
				});
				if (!variant || variant.productId !== productId) {
					return { error: 'Varian produk tidak valid' };
				}
				maxStock = variant.stock;
			}

			const existing = await prisma.cartItem.findFirst({
				where: {
					userId: user.id,
					productId,
					variantId: targetVariantId
				}
			});

			if (action === 'add') {
				const deltaQty = Math.max(1, Math.floor(Number(qty) || 1));
				if (existing) {
					const newQty = Math.min(existing.qty + deltaQty, maxStock);
					await prisma.cartItem.update({
						where: { id: existing.id },
						data: { qty: newQty }
					});
				} else {
					await prisma.cartItem.create({
						data: {
							userId: user.id,
							productId,
							variantId: targetVariantId,
							qty: Math.min(deltaQty, maxStock)
						}
					});
				}
				return { success: true, action: 'add' };
			}

			if (action === 'updateQty') {
				const newTargetQty = Math.floor(Number(qty));
				if (newTargetQty <= 0) {
					await prisma.cartItem.deleteMany({
						where: {
							userId: user.id,
							productId,
							variantId: targetVariantId
						}
					});
					return { success: true, action: 'remove' };
				}

				const safeQty = Math.min(newTargetQty, maxStock);
				if (existing) {
					await prisma.cartItem.update({
						where: { id: existing.id },
						data: { qty: safeQty }
					});
				} else {
					await prisma.cartItem.create({
						data: {
							userId: user.id,
							productId,
							variantId: targetVariantId,
							qty: safeQty
						}
					});
				}
				return { success: true, action: 'updateQty', qty: safeQty };
			}

			return { error: 'Aksi tidak dikenal' };
		};

		// 2. Action-based delta mutations (Anti Lost-Update across tabs/devices)
		if (mutations && Array.isArray(mutations)) {
			for (const mut of mutations) {
				const res = await applyMutation(mut);
				if (res.error) {
					return json({ error: res.error }, { status: 400 });
				}
			}
			return json({ success: true, processedCount: mutations.length });
		}

		// Single mutation payload
		const singleResult = await applyMutation(body);
		if (singleResult.error) {
			return json({ error: singleResult.error }, { status: 400 });
		}
		return json(singleResult);
	} catch (error: any) {
		console.error('Cart sync error:', error);
		return json({ error: 'Gagal menyinkronkan keranjang' }, { status: 500 });
	}
};
