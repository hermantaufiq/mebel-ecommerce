import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { verifyPassword, hashPassword, setSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
		}

		const normalizedEmail = email.trim().toLowerCase();

		let user = await prisma.user.findUnique({
			where: { email: normalizedEmail }
		});

		// Demo account initial setup if logging in as demo user
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

		const isValid = await verifyPassword(password, user.passwordHash);
		if (!isValid) {
			return json({ error: 'Email atau kata sandi tidak valid' }, { status: 401 });
		}

		// Set HTTP-only session cookie
		setSessionCookie(cookies, user.id);

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
