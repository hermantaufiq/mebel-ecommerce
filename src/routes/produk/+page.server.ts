import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';

const ITEMS_PER_PAGE = 12;

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const kategori = url.searchParams.get('kategori') ?? '';
	const sort = url.searchParams.get('sort') ?? 'terbaru';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
	const materials = url.searchParams.getAll('material');
	const statuses = url.searchParams.getAll('status');
	const priceMin = url.searchParams.get('price_min');
	const priceMax = url.searchParams.get('price_max');

	// Build Prisma where clause
	const where: Prisma.ProductWhereInput = {};

	if (q) {
		where.OR = [
			{ name: { contains: q, mode: 'insensitive' } },
			{ material: { contains: q, mode: 'insensitive' } },
			{ description: { contains: q, mode: 'insensitive' } },
			{ category: { name: { contains: q, mode: 'insensitive' } } }
		];
	}

	if (kategori) {
		// kategori can be a room slug (ruang-tamu) or category slug
		const roomName = kategori
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');

		const [roomMatch, categoryMatch] = await Promise.all([
			prisma.category.findFirst({ where: { room: roomName } }),
			prisma.category.findUnique({ where: { slug: kategori } })
		]);

		if (roomMatch || categoryMatch) {
			if (categoryMatch) {
				where.categoryId = categoryMatch.id;
			} else {
				// Filter by room — get all categories in that room
				const roomCategories = await prisma.category.findMany({
					where: { room: roomName },
					select: { id: true }
				});
				where.categoryId = { in: roomCategories.map((c) => c.id) };
			}
		}
	}

	if (materials.length > 0) {
		where.OR = [
			...(where.OR ?? []),
			...materials.map((m) => ({ material: { contains: m, mode: 'insensitive' as const } }))
		];
	}

	if (statuses.length > 0) {
		where.status = { in: statuses };
	}

	if (priceMin || priceMax) {
		where.price = {};
		if (priceMin) where.price.gte = Number(priceMin);
		if (priceMax) where.price.lte = Number(priceMax);
	}

	// Build orderBy
	let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
	if (sort === 'harga-asc') orderBy = { price: 'asc' };
	else if (sort === 'harga-desc') orderBy = { price: 'desc' };
	else if (sort === 'rating') orderBy = { rating: 'desc' };
	else if (sort === 'nama') orderBy = { name: 'asc' };

	const skip = (page - 1) * ITEMS_PER_PAGE;

	try {
		const [products, totalCount, categoriesRaw] = await Promise.all([
			prisma.product.findMany({
				where,
				orderBy,
				skip,
				take: ITEMS_PER_PAGE,
				include: {
					images: { orderBy: { sortOrder: 'asc' }, take: 1 },
					variants: true,
					category: true
				}
			}),
			prisma.product.count({ where }),
			prisma.category.findMany({
				orderBy: { name: 'asc' },
				include: {
					_count: {
						select: { products: true }
					}
				}
			})
		]);

		const categories = categoriesRaw.map((c) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			room: c.room,
			productCount: c._count.products
		}));

		return {
			products,
			totalCount,
			categories,
			currentPage: page,
			totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
			filters: { q, kategori, sort, materials, statuses, priceMin, priceMax }
		};
	} catch (err) {
		console.error('Failed to load products from database:', err);
		return {
			products: [],
			totalCount: 0,
			categories: [],
			currentPage: 1,
			totalPages: 0,
			filters: { q, kategori, sort, materials, statuses, priceMin, priceMax }
		};
	}
};
