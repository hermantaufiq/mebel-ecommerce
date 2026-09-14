import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { hashPassword, setSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return json({ error: 'Nama, email, dan kata sandi wajib diisi' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 });
		}

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

		return json({
			success: true,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
				tier: newUser.tier,
				loyaltyPoints: newUser.loyaltyPoints
			}
		});
	} catch (err: any) {
		console.error('Register error:', err);
		return json({ error: 'Terjadi kesalahan saat mendaftarkan akun baru' }, { status: 500 });
	}
};
