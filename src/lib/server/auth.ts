import type { Cookies } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';

export const SESSION_COOKIE_NAME = 'ml_session';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function setSessionCookie(cookies: Cookies, userId: string) {
	cookies.set(SESSION_COOKIE_NAME, userId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 30 // 30 days
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export async function getSessionUser(cookies: Cookies) {
	const userId = cookies.get(SESSION_COOKIE_NAME);
	if (!userId) {
		return null;
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				tier: true,
				loyaltyPoints: true,
				createdAt: true
			}
		});
		return user;
	} catch (err) {
		console.error('Error reading session user:', err);
		return null;
	}
}
