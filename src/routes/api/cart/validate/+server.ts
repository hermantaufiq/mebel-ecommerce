import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { items } = await request.json();

		if (!items || !Array.isArray(items)) {
			return json({ items: [] });
		}

		const validatedItems = await Promise.all(
			items.map(async (item: any) => {
				const productId = item.productId || item.id;
				const variantId = item.variantId || null;

				const product = await prisma.product.findUnique({
					where: { id: productId },
					select: { id: true, name: true, price: true }
				});

				if (!product) {
					return {
						id: item.id,
						productId,
						variantId,
						isAvailable: false,
						availableStock: 0,
						currentPrice: item.unitPrice || 0,
						adjustedQty: 0,
						name: item.name || 'Produk'
					};
				}

				let availableStock = 99;
				let currentPrice = product.price;

				if (variantId) {
					const variant = await prisma.productVariant.findUnique({
						where: { id: variantId }
					});

					if (variant && variant.productId === product.id) {
						availableStock = Math.max(0, variant.stock);
						currentPrice = product.price + (variant.priceOffset || 0);
					} else {
						availableStock = 0;
					}
				}

				const isAvailable = availableStock > 0;
				const adjustedQty = isAvailable ? Math.min(item.qty, availableStock) : 0;

				return {
					id: item.id,
					productId: product.id,
					variantId,
					isAvailable,
					availableStock,
					currentPrice,
					adjustedQty,
					name: product.name
				};
			})
		);

		return json({
			success: true,
			items: validatedItems
		});
	} catch (error: any) {
		console.error('Cart validate error:', error);
		return json({ error: 'Gagal memvalidasi ketersediaan stok' }, { status: 500 });
	}
};
