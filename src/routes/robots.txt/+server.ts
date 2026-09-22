import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;

	const content = `User-agent: *
Allow: /
Disallow: /akun/
Disallow: /api/
Disallow: /checkout/

Sitemap: ${origin}/sitemap.xml
`.trim();

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
