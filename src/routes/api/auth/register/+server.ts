import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { hashPassword, setSessionCookie } from '$lib/server/auth';
import { authRateLimiter } from '$lib/server/rate-limiter';
import { registerSchema } from '$lib/schemas/auth';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	try {
		// Rate limiting check (Tahap 5)
		const clientIp = getClientAddress();
		const rateCheck = authRateLimiter.check(`register:${clientIp}`);
		if (!rateCheck.allowed) {
			return json(
				{ error: 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam beberapa saat.' },
				{
					status: 429,
					headers: {
						'Retry-After': String(Math.ceil(rateCheck.resetInMs / 1000)),
						'X-RateLimit-Remaining': '0'
					}
				}
			);
		}

		const body = await request.json();
		const { guestCartItems = [] } = body;

		// Zod validation — single source of truth for min 8 chars (Koreksi 1)
		const parseResult = registerSchema.safeParse(body);
		if (!parseResult.success) {
			const firstError = parseResult.error.issues?.[0];
			return json({ error: firstError?.message || 'Data pendaftaran tidak valid' }, { status: 400 });
		}

		const { name, email, password } = parseResult.data;

		const normalizedEmail = email.trim().toLowerCase();

		const existing = await prisma.user.findUnique({
			where: { email: normalizedEmail }
		});

		if (existing) {
			return json(
				{ error: 'Email ini sudah terdaftar. Silakan masuk dengan kata sandi Anda.' },
				{ status: 400 }
			);
		}

		const passwordHash = await hashPassword(password);

		const newUser = await prisma.user.create({
			data: {
				name: name.trim(),
				email: normalizedEmail,
				passwordHash,
				role: 'user',
				tier: 'Regular',
				loyaltyPoints: 100 // Welcome reward points
			}
		});

		// Auto login on registration
		setSessionCookie(cookies, newUser.id);

		// Merge guest cart items into new user's DB cart if provided
		let consolidatedCartItems: any[] = [];

		if (guestCartItems && Array.isArray(guestCartItems) && guestCartItems.length > 0) {
			try {
				for (const gItem of guestCartItems) {
					const productId = gItem.productId;
					const variantId = gItem.variantId || null;
					const qty = Math.max(1, Math.floor(Number(gItem.qty) || 1));

					const product = await prisma.product.findUnique({
						where: { id: productId },
						select: { id: true }
					});
					if (!product) continue;

					let maxStock = 99;
					if (variantId) {
						const variant = await prisma.productVariant.findUnique({
							where: { id: variantId },
							select: { stock: true }
						});
						if (!variant) continue;
						maxStock = variant.stock;
					}

					await prisma.cartItem.create({
						data: {
							userId: newUser.id,
							productId,
							variantId,
							qty: Math.min(qty, maxStock)
						}
					});
				}

				const dbCart = await prisma.cartItem.findMany({
					where: { userId: newUser.id },
					include: {
						product: {
							include: {
								images: true,
								variants: true
							}
						}
					}
				});

				consolidatedCartItems = dbCart.map((item) => {
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
			} catch (syncErr) {
				console.warn('Guest cart merge on register failed (non-blocking):', syncErr);
			}
		}

		return json({
			success: true,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
				tier: newUser.tier,
				loyaltyPoints: newUser.loyaltyPoints
			},
			cartItems: consolidatedCartItems
		});
	} catch (err: any) {
		console.error('Register error:', err);
		return json({ error: 'Terjadi kesalahan saat mendaftarkan akun baru' }, { status: 500 });
	}
};
