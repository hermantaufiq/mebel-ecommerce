import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	try {
		const product = await prisma.product.findUnique({
			where: { slug },
			include: {
				images: { orderBy: { sortOrder: 'asc' } },
				variants: true,
				category: true
			}
		});

		if (!product) {
			throw error(404, {
				message: `Produk "${slug}" tidak ditemukan`
			});
		}

		// Load related products from the same category (exclude current)
		const relatedProducts = await prisma.product.findMany({
			where: {
				categoryId: product.categoryId,
				id: { not: product.id }
			},
			take: 4,
			orderBy: { rating: 'desc' },
			include: {
				images: { orderBy: { sortOrder: 'asc' }, take: 1 },
				variants: true,
				category: true
			}
		});

		// JSON-LD Product schema
		const productUrl = `https://maisonlumina.id/produk/${slug}`;
		const jsonLd = {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.description,
			image: product.images.map((img) => img.url),
			sku: product.id,
			brand: {
				'@type': 'Brand',
				name: 'Maison Lumina'
			},
			offers: {
				'@type': 'Offer',
				url: productUrl,
				priceCurrency: 'IDR',
				price: product.price,
				availability:
					product.status === 'Ready Stock'
						? 'https://schema.org/InStock'
						: 'https://schema.org/PreOrder',
				seller: {
					'@type': 'Organization',
					name: 'Maison Lumina'
				}
			},
			aggregateRating:
				product.reviewCount > 0
					? {
							'@type': 'AggregateRating',
							ratingValue: product.rating,
							reviewCount: product.reviewCount
						}
					: undefined
		};

		return {
			product,
			relatedProducts,
			jsonLd
		};
	} catch (err) {
		// Re-throw SvelteKit errors (like 404)
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Failed to load product detail:', err);
		throw error(500, { message: 'Gagal memuat halaman produk. Silakan coba lagi.' });
	}
};
