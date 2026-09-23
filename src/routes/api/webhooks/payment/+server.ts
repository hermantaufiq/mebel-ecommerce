import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import crypto from 'node:crypto';

// Default webhook secret key (synced with .env PAYMENT_WEBHOOK_SECRET)
const DEFAULT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'maison_lumina_webhook_secret_key_2026';

/**
 * Validates HMAC SHA-256 signature from payment gateway webhook request
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret = DEFAULT_WEBHOOK_SECRET): boolean {
	if (!signature || !secret) return false;
	try {
		const cleanSig = signature.replace(/^sha256=/, '').trim().toLowerCase();
		const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex').toLowerCase();
		if (cleanSig.length !== computed.length) return false;
		return crypto.timingSafeEqual(Buffer.from(cleanSig), Buffer.from(computed));
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const rawBody = await request.text();

		// 1. Mandatory HMAC Signature Verification (Koreksi 1)
		const signatureHeader =
			request.headers.get('x-signature') ||
			request.headers.get('x-callback-signature') ||
			request.headers.get('x-webhook-signature');

		const secret = process.env.PAYMENT_WEBHOOK_SECRET || DEFAULT_WEBHOOK_SECRET;

		if (!verifyWebhookSignature(rawBody, signatureHeader, secret)) {
			// Also check if signature is provided in payload (e.g. Midtrans signature_key parameter)
			let payloadSigValid = false;
			try {
				const parsed = JSON.parse(rawBody);
				if (parsed.signature_key && verifyWebhookSignature(rawBody.replace(/,"signature_key":"[^"]*"/, ''), parsed.signature_key, secret)) {
					payloadSigValid = true;
				}
			} catch {
				// parse failure handled below
			}

			if (!payloadSigValid) {
				return json(
					{ error: 'Invalid or missing webhook signature' },
					{ status: 401 }
				);
			}
		}

		let body: any;
		try {
			body = JSON.parse(rawBody);
		} catch {
			return json({ error: 'Format JSON payload tidak valid' }, { status: 400 });
		}

		const orderNumber = (body.orderNumber || body.order_id)?.trim();
		const rawStatus = (body.transaction_status || body.status || body.payment_status)?.toLowerCase().trim();

		if (!orderNumber || !rawStatus) {
			return json(
				{ error: 'Field orderNumber dan status transaksi wajib disertakan' },
				{ status: 400 }
			);
		}

		// 2. Fetch order to verify existence
		const order = await prisma.order.findUnique({
			where: { orderNumber },
			include: { items: true }
		});

		if (!order) {
			return json({ error: `Pesanan dengan nomor ${orderNumber} tidak ditemukan` }, { status: 404 });
		}

		// 3. Skenario Pembayaran Sukses (settlement, capture, paid, success)
		const isSuccess = ['settlement', 'capture', 'paid', 'success'].includes(rawStatus);
		if (isSuccess) {
			// Atomic conditional update to prevent race conditions on duplicate gateway retries (Koreksi 2)
			const updateResult = await prisma.order.updateMany({
				where: {
					orderNumber,
					paymentStatus: { not: 'Paid' }
				},
				data: {
					paymentStatus: 'Paid',
					status: 'Disiapkan'
				}
			});

			if (updateResult.count === 0) {
				return json({
					success: true,
					message: 'Transaksi sudah tercatat sebelumnya (idempotent)',
					orderNumber,
					alreadyProcessed: true
				});
			}

			return json({
				success: true,
				message: `Status pembayaran pesanan #${orderNumber} berhasil diperbarui ke Paid`,
				orderNumber,
				paymentStatus: 'Paid',
				orderStatus: 'Disiapkan',
				alreadyProcessed: false
			});
		}

		// 4. Skenario Pembatalan / Kadaluarsa (cancel, expire, deny, failed)
		const isCancelled = ['cancel', 'expire', 'deny', 'failed'].includes(rawStatus);
		if (isCancelled) {
			const paymentStatusLabel = rawStatus === 'expire' ? 'Expired' : 'Cancelled';

			// Atomic conditional update with stockRestored idempotency flag (Koreksi 3)
			const result = await prisma.$transaction(async (tx) => {
				const updateResult = await tx.order.updateMany({
					where: {
						orderNumber,
						stockRestored: false
					},
					data: {
						paymentStatus: paymentStatusLabel,
						status: 'Dibatalkan',
						stockRestored: true
					}
				});

				// Only increment stock if this update was the first to flip stockRestored to true
				if (updateResult.count > 0) {
					for (const item of order.items) {
						if (item.variantId) {
							await tx.productVariant.update({
								where: { id: item.variantId },
								data: {
									stock: {
										increment: item.qty
									}
								}
							});
						}
					}
					return { restored: true, alreadyProcessed: false };
				}

				return { restored: false, alreadyProcessed: true };
			});

			return json({
				success: true,
				message: result.alreadyProcessed
					? 'Pembatalan pesanan sudah diproses sebelumnya (idempotent)'
					: `Pesanan #${orderNumber} dibatalkan dan stok produk telah dipulihkan`,
				orderNumber,
				paymentStatus: paymentStatusLabel,
				orderStatus: 'Dibatalkan',
				stockRestored: result.restored,
				alreadyProcessed: result.alreadyProcessed
			});
		}

		// Skenario Pending
		if (rawStatus === 'pending') {
			return json({
				success: true,
				message: `Pesanan #${orderNumber} dalam status menunggu pembayaran`,
				orderNumber,
				paymentStatus: 'Pending',
				alreadyProcessed: false
			});
		}

		return json({ error: `Status transaksi '${rawStatus}' tidak dikenali` }, { status: 400 });
	} catch (error: any) {
		console.error('Payment webhook error:', error);
		return json({ error: error.message || 'Gagal memproses webhook pembayaran' }, { status: 500 });
	}
};
