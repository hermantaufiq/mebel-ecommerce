import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;

	// Fetch all active products
	let products: { slug: string; createdAt: Date }[] = [];
	try {
		products = await prisma.product.findMany({
			select: { slug: true, createdAt: true },
			orderBy: { createdAt: 'desc' }
		});
	} catch (e) {
		console.warn('Failed to fetch products for sitemap:', e);
	}

	const staticPages = [
		'',
		'/produk',
		'/craftsmanship',
		'/room-planner',
		'/keranjang',
		'/login'
	];

	const sitemapEntries = [
		...staticPages.map((route) => `
		<url>
			<loc>${origin}${route}</loc>
			<changefreq>${route === '' || route === '/produk' ? 'daily' : 'weekly'}</changefreq>
			<priority>${route === '' ? '1.0' : route === '/produk' ? '0.9' : '0.7'}</priority>
		</url>`),
		...products.map((p) => `
		<url>
			<loc>${origin}/produk/${p.slug}</loc>
			<lastmod>${p.createdAt.toISOString().split('T')[0]}</lastmod>
			<changefreq>weekly</changefreq>
			<priority>0.8</priority>
		</url>`)
	].join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`.trim();

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};
