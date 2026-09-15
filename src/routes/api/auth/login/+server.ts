import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { verifyPassword, hashPassword, setSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password, guestCartItems } = await request.json();

		if (!email || !password) {
			return json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
		}

		const normalizedEmail = email.trim().toLowerCase();

		let user = await prisma.user.findUnique({
			where: { email: normalizedEmail }
		});

		// Demo account initial setup (only creates hash if user has none yet)
		if (normalizedEmail === 'dian.sastro@example.com') {
			if (!user) {
				const defaultHash = await hashPassword('password123');
				user = await prisma.user.create({
					data: {
						name: 'Dian Sastrowardoyo',
						email: 'dian.sastro@example.com',
						passwordHash: defaultHash,
						role: 'user',
						tier: 'VIP',
						loyaltyPoints: 1250
					}
				});
			} else if (!user.passwordHash) {
				const defaultHash = await hashPassword('password123');
				user = await prisma.user.update({
					where: { id: user.id },
					data: { passwordHash: defaultHash }
				});
			}
		}

		if (!user || !user.passwordHash) {
			// Generic error prevents email enumeration
			return json({ error: 'Email atau kata sandi tidak valid' }, { status: 401 });
		}

		// Strict password verification via bcrypt.compare
		const isValid = await verifyPassword(password, user.passwordHash);
		if (!isValid) {
			return json({ error: 'Email atau kata sandi tidak valid' }, { status: 401 });
		}

		// Set HTTP-only session cookie
		setSessionCookie(cookies, user.id);

		// Merge guest cart items into user's DB cart if provided
		if (guestCartItems && Array.isArray(guestCartItems) && guestCartItems.length > 0) {
			try {
				const existingCartItems = await prisma.cartItem.findMany({
					where: { userId: user.id }
				});

				for (const gItem of guestCartItems) {
					const productId = gItem.productId;
					const variantId = gItem.variantId || null;
					const qty = Math.max(1, Math.floor(Number(gItem.qty) || 1));

					// Verify product exists
					const product = await prisma.product.findUnique({
						where: { id: productId },
						select: { id: true }
					});
					if (!product) continue;

					// Check max stock for variant
					let maxStock = 99;
					if (variantId) {
						const variant = await prisma.productVariant.findUnique({
							where: { id: variantId },
							select: { stock: true }
						});
						if (!variant) continue;
						maxStock = variant.stock;
					}

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
			} catch (syncErr) {
				console.warn('Guest cart merge on login failed (non-blocking):', syncErr);
			}
		}

		return json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				tier: user.tier,
				loyaltyPoints: user.loyaltyPoints
			}
		});
	} catch (err: any) {
		console.error('Login error:', err);
		return json({ error: 'Terjadi kesalahan sistem saat proses masuk' }, { status: 500 });
	}
};
