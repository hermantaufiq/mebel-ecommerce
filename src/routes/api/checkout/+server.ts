import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { calculateCartTotals } from '$lib/cart-calculations';

export const POST: RequestHandler = async ({ request }) => {
	try {
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
			paymentMethod = 'Transfer Bank'
		} = body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			return json({ error: 'Keranjang belanja kosong' }, { status: 400 });
		}

		if (!recipientName || !recipientPhone || !shippingAddress) {
			return json(
				{ error: 'Nama penerima, nomor telepon, dan alamat pengiriman wajib diisi' },
				{ status: 400 }
			);
		}

		// Calculate server-side totals
		const totals = calculateCartTotals(
			items.map((i) => ({ unitPrice: i.unitPrice || i.price, qty: i.qty })),
			{
				shippingFee: 0, // Free delivery Jabodetabek
				installFee: 0,  // Free assembly service
				applyTax: true
			}
		);

		// Resolve or create user (VIP demo account or existing)
		let user = await prisma.user.findFirst({
			where: { email: 'dian.sastro@example.com' }
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					name: recipientName || 'Dian Sastrowardoyo',
					email: 'dian.sastro@example.com',
					role: 'user',
					tier: 'VIP',
					loyaltyPoints: 1250
				}
			});
		}

		// Fallback product in case mock product IDs differ
		const firstProduct = await prisma.product.findFirst({ select: { id: true, price: true } });

		// Prepare order items
		const orderItemsData = await Promise.all(
			items.map(async (item: any) => {
				const rawId = item.productId || item.id;
				const slug = item.slug;

				let validProduct = null;
				if (rawId) {
					validProduct = await prisma.product.findUnique({
						where: { id: rawId },
						select: { id: true, price: true }
					});
				}
				if (!validProduct && slug) {
					validProduct = await prisma.product.findUnique({
						where: { slug },
						select: { id: true, price: true }
					});
				}

				const finalProductId = validProduct?.id || firstProduct?.id;
				if (!finalProductId) {
					throw new Error('Produk tidak valid dalam pesanan');
				}

				const priceAtOrder = Math.round(
					item.unitPrice || item.price || validProduct?.price || 0
				);

				return {
					productId: finalProductId,
					variantLabel: item.variantLabel || null,
					qty: Math.max(1, item.qty || 1),
					priceAtOrder
				};
			})
		);

		// Generate random unique orderNumber ML-XXXXX
		const randomDigits = Math.floor(10000 + Math.random() * 90000);
		const orderNumber = `ML-${randomDigits}`;

		// Execute database transaction
		const order = await prisma.$transaction(async (tx) => {
			// 1. Create order and order items
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
						create: orderItemsData
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

			// 2. Decrement stock for variants if variantId provided
			for (const item of items) {
				if (item.variantId) {
					try {
						const variant = await tx.productVariant.findUnique({
							where: { id: item.variantId }
						});
						if (variant && variant.stock >= item.qty) {
							await tx.productVariant.update({
								where: { id: item.variantId },
								data: {
									stock: {
										decrement: item.qty
									}
								}
							});
						}
					} catch (variantErr) {
						console.warn('Could not decrement variant stock:', variantErr);
					}
				}
			}

			return newOrder;
		});

		return json({
			success: true,
			orderNumber: order.orderNumber,
			orderId: order.id,
			order
		});
	} catch (error: any) {
		console.error('Checkout API error:', error);
		return json(
			{ error: error.message || 'Gagal memproses transaksi pesanan' },
			{ status: 500 }
		);
	}
};
