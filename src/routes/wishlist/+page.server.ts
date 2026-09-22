import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { getSessionUser } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		const user = await getSessionUser(cookies);

		let dbWishlistItems: Array<{
			id: string;
			productId: string;
			name: string;
			slug: string;
			price: number;
			image: string;
			category: string;
			material?: string;
		}> = [];

		if (user) {
			const items = await prisma.wishlistItem.findMany({
				where: { userId: user.id },
				include: {
					product: {
						include: {
							images: { orderBy: { sortOrder: 'asc' } },
							variants: true,
							category: true
						}
					}
				},
				orderBy: { addedAt: 'desc' }
			});

			dbWishlistItems = items.map((w) => {
				const primaryImage =
					w.product.images.length > 0
						? w.product.images[0]?.url || '/images/products/placeholder.jpg'
						: '/images/products/placeholder.jpg';

				return {
					id: w.id,
					productId: w.product.id,
					name: w.product.name,
					slug: w.product.slug,
					price: w.product.price,
					image: primaryImage,
					category: w.product.category?.name || 'Mebel',
					material: (w.product.attributes as any)?.material || undefined
				};
			});
		}

		const recommendations = await prisma.product.findMany({
			take: 4,
			orderBy: { rating: 'desc' },
			include: {
				images: {
					orderBy: { sortOrder: 'asc' }
				},
				variants: true,
				category: true
			}
		});

		return {
			user,
			dbWishlistItems,
			recommendations
		};
	} catch (err) {
		console.error('Failed to load wishlist page data:', err);
		return {
			user: null,
			dbWishlistItems: [],
			recommendations: []
		};
	}
};
