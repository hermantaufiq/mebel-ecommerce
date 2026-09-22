import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	try {
		const [featuredProducts, categories] = await Promise.all([
			prisma.product.findMany({
				take: 4,
				orderBy: { rating: 'desc' },
				include: {
					images: {
						orderBy: { sortOrder: 'asc' }
					},
					variants: true,
					category: true
				}
			}),
			prisma.category.findMany({
				orderBy: { name: 'asc' }
			})
		]);

		return {
			featuredProducts,
			categories
		};
	} catch (err) {
		console.error('Failed to load home page products from database:', err);
		return {
			featuredProducts: [],
			categories: []
		};
	}
};
