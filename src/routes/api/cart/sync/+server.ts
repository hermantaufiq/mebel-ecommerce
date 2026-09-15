import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getSessionUser } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			return json({ error: 'Tidak terotentikasi' }, { status: 401 });
		}

		const { guestItems = [] } = await request.json();

		// Fetch user's existing DB cart items
		const existingCartItems = await prisma.cartItem.findMany({
			where: { userId: user.id }
		});

		// Merge guest items into DB
		for (const gItem of guestItems) {
			const productId = gItem.productId || gItem.id;
			const variantId = gItem.variantId || null;
			const qty = Math.max(1, Math.floor(Number(gItem.qty) || 1));

			// Verify product exists
			const product = await prisma.product.findUnique({
				where: { id: productId },
				select: { id: true }
			});
			if (!product) continue;

			// Verify variant stock if variantId provided
			let maxStock = 99;
			if (variantId) {
				const variant = await prisma.productVariant.findUnique({
					where: { id: variantId },
					select: { id: true, stock: true }
				});
				if (!variant) continue;
				maxStock = variant.stock;
			}

			// Check if already in user's DB cart
			const existing = existingCartItems.find(
				(item) => item.productId === productId && (item.variantId ?? null) === variantId
			);

			if (existing) {
				const newQty = Math.min(existing.qty + qty, maxStock);
				await prisma.cartItem.update({
					where: { id: existing.id },
					data: { qty: newQty }
				});
			} else {
				await prisma.cartItem.create({
					data: {
						userId: user.id,
						productId,
						variantId,
						qty: Math.min(qty, maxStock)
					}
				});
			}
		}

		// Retrieve all consolidated cart items with full product details
		const mergedDbCart = await prisma.cartItem.findMany({
			where: { userId: user.id },
			include: {
				product: {
					include: {
						images: true,
						variants: true
					}
				}
			}
		});

		const items = mergedDbCart.map((item) => {
			const variant = item.variantId
				? item.product.variants.find((v) => v.id === item.variantId)
				: null;
			const unitPrice = item.product.price + (variant?.priceOffset || 0);
			const maxStock = variant ? variant.stock : 99;

			return {
				id: item.id,
				productId: item.productId,
				variantId: item.variantId,
				name: item.product.name,
				image: item.product.images[0]?.url || '',
				unitPrice,
				qty: Math.min(item.qty, maxStock),
				maxStock,
				material: item.product.material,
				variantLabel: variant?.label,
				slug: item.product.slug
			};
		});

		return json({
			success: true,
			items
		});
	} catch (error: any) {
		console.error('Cart sync error:', error);
		return json({ error: 'Gagal menyinkronkan keranjang' }, { status: 500 });
	}
};
