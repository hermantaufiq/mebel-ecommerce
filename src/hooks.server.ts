import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getSessionUser } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Populate current authenticated user from session cookie
	event.locals.user = await getSessionUser(event.cookies);

	// 2. Protected routes guard
	const pathname = event.url.pathname;
	if (pathname.startsWith('/akun')) {
		if (!event.locals.user) {
			const target = encodeURIComponent(pathname + event.url.search);
			throw redirect(303, `/login?redirect=${target}`);
		}
	}

	// 3. Resolve request and append security headers
	const response = await resolve(event);

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `err-${Date.now()}`;
	console.error(`[Maison Lumina Server Error] ID: ${errorId}`, {
		timestamp: new Date().toISOString(),
		status,
		message,
		pathname: event.url.pathname,
		error: error instanceof Error ? error.stack : error
	});

	return {
		message: status === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kendala teknis pada sistem atelier',
		errorId
	};
};
