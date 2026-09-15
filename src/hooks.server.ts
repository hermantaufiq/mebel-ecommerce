import type { Handle } from '@sveltejs/kit';
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

	return resolve(event);
};
