import crypto from 'node:crypto';

// Default webhook secret key (synced with .env PAYMENT_WEBHOOK_SECRET)
export const DEFAULT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'maison_lumina_webhook_secret_key_2026';

/**
 * Validates HMAC SHA-256 signature from payment gateway webhook request
 */
export function verifyWebhookSignature(
	rawBody: string,
	signature: string | null,
	secret = DEFAULT_WEBHOOK_SECRET
): boolean {
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
