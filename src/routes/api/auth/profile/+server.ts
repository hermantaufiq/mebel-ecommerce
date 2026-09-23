import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { verifyPassword, hashPassword } from '$lib/server/auth';
import { authRateLimiter } from '$lib/server/rate-limiter';
import { updateProfileSchema, changePasswordSchema } from '$lib/schemas/auth';

export const PUT: RequestHandler = async ({ request, locals, url, getClientAddress }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Silakan masuk ke akun Anda terlebih dahulu' }, { status: 401 });
	}

	const action = url.searchParams.get('action');

	// ====================================================================
	// Change Password (rate-limited — Koreksi 4)
	// ====================================================================
	if (action === 'change-password') {
		// Rate limiter on password change to prevent brute-force of currentPassword
		const clientIp = getClientAddress();
		const rateCheck = authRateLimiter.check(`change-pwd:${clientIp}:${user.id}`);
		if (!rateCheck.allowed) {
			return json(
				{ error: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa saat.' },
				{
					status: 429,
					headers: {
						'Retry-After': String(Math.ceil(rateCheck.resetInMs / 1000)),
						'X-RateLimit-Remaining': '0'
					}
				}
			);
		}

		try {
			const body = await request.json();

			// Zod validation — single source of truth for min 8 chars (Koreksi 1)
			const parseResult = changePasswordSchema.safeParse(body);
			if (!parseResult.success) {
				const firstError = parseResult.error.issues?.[0];
				return json(
					{ error: firstError?.message || 'Data tidak valid' },
					{ status: 400 }
				);
			}

			const { currentPassword, newPassword } = parseResult.data;

			// Fetch current password hash
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: { passwordHash: true }
			});

			if (!dbUser?.passwordHash) {
				return json({ error: 'Akun ini tidak memiliki kata sandi yang bisa diubah' }, { status: 400 });
			}

			// Verify current password
			const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
			if (!isValid) {
				return json({ error: 'Kata sandi lama tidak sesuai' }, { status: 401 });
			}

			// Hash and update new password
			const newHash = await hashPassword(newPassword);
			await prisma.user.update({
				where: { id: user.id },
				data: { passwordHash: newHash }
			});

			return json({
				success: true,
				message: 'Kata sandi berhasil diperbarui'
			});
		} catch (err: any) {
			console.error('Error changing password:', err);
			return json({ error: 'Terjadi kesalahan saat mengubah kata sandi' }, { status: 500 });
		}
	}

	// ====================================================================
	// Update Profile (name)
	// ====================================================================
	try {
		const body = await request.json();

		const parseResult = updateProfileSchema.safeParse(body);
		if (!parseResult.success) {
			const firstError = parseResult.error.issues?.[0];
			return json(
				{ error: firstError?.message || 'Data tidak valid' },
				{ status: 400 }
			);
		}

		const { name } = parseResult.data;

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: { name: name.trim() },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				tier: true,
				loyaltyPoints: true,
				totalSpending: true
			}
		});

		return json({
			success: true,
			message: 'Profil berhasil diperbarui',
			user: updatedUser
		});
	} catch (err: any) {
		console.error('Error updating profile:', err);
		return json({ error: 'Terjadi kesalahan saat memperbarui profil' }, { status: 500 });
	}
};
