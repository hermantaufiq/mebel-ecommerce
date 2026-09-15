import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { getSessionUser } from '$lib/server/auth';
import { calculateCartTotals } from '$lib/cart-calculations';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// 1. Authenticate user from session cookie (no bypass/default account)
		const user = await getSessionUser(cookies);
		if (!user) {
			return json(
				{
					error: 'Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan pesanan.',
					requireLogin: true
				},
				{ status: 401 }
			);
		}

		const body = await request.json();
		const {
			items,
			recipientName,
			recipientPhone,
			shippingAddress,
			deliveryNote,
			deliveryDate,
			deliverySlot,
			installService = true,
			paymentMethod = 'Transfer Bank (BCA / Mandiri VA)'
		} = body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			return json({ error: 'Keranjang belanja kosong' }, { status: 400 });
		}

		if (!recipientName?.trim() || !recipientPhone?.trim() || !shippingAddress?.trim()) {
			return json(
				{ error: 'Nama penerima, nomor telepon, dan alamat pengiriman wajib diisi' },
				{ status: 400 }
			);
		}

		// 2. Fetch and strictly validate product price & stock from database (NEVER trust client payload)
		interface VerifiedOrderItem {
			productId: string;
			variantId: string | null;
			variantLabel: string | null;
			qty: number;
			priceAtOrder: number;
		}

		const verifiedItems: VerifiedOrderItem[] = [];

		for (const item of items) {
			const rawProductId = item.productId || item.id;
			if (!rawProductId) {
				return json({ error: 'Data produk dalam keranjang tidak valid' }, { status: 400 });
			}

			// Query real product from database
			let dbProduct = await prisma.product.findUnique({
				where: { id: rawProductId },
				select: { id: true, name: true, price: true }
			});

			if (!dbProduct && item.slug) {
				dbProduct = await prisma.product.findUnique({
					where: { slug: item.slug },
					select: { id: true, name: true, price: true }
				});
			}

			if (!dbProduct) {
				return json(
					{ error: `Produk "${item.name || 'furnitur'}" sudah tidak tersedia dalam katalog.` },
					{ status: 400 }
				);
			}

			const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
			let variantLabel: string | null = item.variantLabel || null;
			let priceOffset = 0;

			// If variant specified, strictly validate variant from DB
			if (item.variantId) {
				const dbVariant = await prisma.productVariant.findUnique({
					where: { id: item.variantId }
				});

				if (!dbVariant || dbVariant.productId !== dbProduct.id) {
					return json(
						{ error: `Varian yang dipilih untuk produk "${dbProduct.name}" tidak valid.` },
						{ status: 400 }
					);
				}

				if (dbVariant.stock < qty) {
					return json(
						{
							error: `Stok untuk "${dbProduct.name} (${dbVariant.label})" tidak mencukupi (sisa: ${dbVariant.stock}, diminta: ${qty}).`
						},
						{ status: 400 }
					);
				}

				priceOffset = dbVariant.priceOffset || 0;
				variantLabel = dbVariant.label;
			}

			// Server-calculated immutable unit price
			const verifiedUnitPrice = dbProduct.price + priceOffset;

			verifiedItems.push({
				productId: dbProduct.id,
				variantId: item.variantId || null,
				variantLabel,
				qty,
				priceAtOrder: verifiedUnitPrice
			});
		}

		// 3. Single source of truth calculation with verified database prices
		const totals = calculateCartTotals(
			verifiedItems.map((i) => ({ unitPrice: i.priceAtOrder, qty: i.qty })),
			{
				shippingFee: 0, // Free delivery Jabodetabek
				installFee: 0,  // Free assembly service
				applyTax: true
			}
		);

		// 4. Generate unique orderNumber ML-XXXXX
		const randomDigits = Math.floor(10000 + Math.random() * 90000);
		const orderNumber = `ML-${randomDigits}`;

		// 5. Execute atomic transaction (Create order + Decrement stock + Clear user cart)
		const order = await prisma.$transaction(async (tx) => {
			// A. Atomic stock verification & decrement
			for (const vItem of verifiedItems) {
				if (vItem.variantId) {
					const freshVariant = await tx.productVariant.findUnique({
						where: { id: vItem.variantId }
					});

					if (!freshVariant || freshVariant.stock < vItem.qty) {
						throw new Error(
							`Stok untuk varian "${vItem.variantLabel || 'produk'}" baru saja habis atau tidak mencukupi (tersedia: ${freshVariant?.stock ?? 0}).`
						);
					}

					await tx.productVariant.update({
						where: { id: vItem.variantId },
						data: {
							stock: {
								decrement: vItem.qty
							}
						}
					});
				}
			}

			// B. Create order with immutable server-calculated prices
			const newOrder = await tx.order.create({
				data: {
					orderNumber,
					userId: user.id,
					status: 'Diterima',
					subtotal: totals.subtotal,
					shippingFee: totals.shippingFee,
					installFee: totals.installFee,
					tax: totals.tax,
					total: totals.total,
					paymentMethod,
					paymentStatus: 'Pending',
					recipientName: recipientName.trim(),
					recipientPhone: recipientPhone.trim(),
					shippingAddress: shippingAddress.trim(),
					deliveryNote: deliveryNote ? deliveryNote.trim() : null,
					deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(Date.now() + 3 * 86400000),
					deliverySlot: deliverySlot || 'Pagi (09:00 - 12:00 WIB)',
					installService: Boolean(installService),
					items: {
						create: verifiedItems.map((item) => ({
							productId: item.productId,
							variantLabel: item.variantLabel,
							qty: item.qty,
							priceAtOrder: item.priceAtOrder
						}))
					}
				},
				include: {
					items: {
						include: {
							product: true
						}
					}
				}
			});

			// C. Clear any persistent database cart items for this logged-in user
			await tx.cartItem.deleteMany({
				where: { userId: user.id }
			});

			return newOrder;
		});

		return json({
			success: true,
			orderNumber: order.orderNumber,
			orderId: order.id
		});
	} catch (error: any) {
		console.error('Checkout API error:', error);
		return json(
			{ error: error.message || 'Gagal memproses transaksi pesanan' },
			{ status: 400 }
		);
	}
};
