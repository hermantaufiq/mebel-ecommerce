import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: { orderBy: { sortOrder: "asc" } };
    variants: true;
  };
}>;

export async function getFeaturedProducts(
  limit: number = 4
): Promise<ProductWithDetails[]> {
  return prisma.product.findMany({
    take: limit,
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
}

export interface ProductFilterParams {
  categorySlug?: string;
  room?: string;
  materials?: string[];
  priceMin?: number;
  priceMax?: number;
  availability?: string[];
  colors?: string[];
  sort?: "featured" | "price_asc" | "price_desc" | "newest" | string;
  page?: number;
  pageSize?: number;
}

export async function getProductsByCategory(
  filters: ProductFilterParams = {}
): Promise<{
  products: ProductWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}> {
  const {
    categorySlug,
    room,
    materials,
    priceMin,
    priceMax,
    availability,
    colors,
    sort = "featured",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {};

  const categoryWhere: Prisma.CategoryWhereInput = {};
  if (categorySlug && categorySlug !== "all" && categorySlug !== "semua") {
    categoryWhere.slug = categorySlug;
  }
  if (room) {
    categoryWhere.room = { equals: room, mode: "insensitive" };
  }
  if (Object.keys(categoryWhere).length > 0) {
    where.category = categoryWhere;
  }

  if (materials && materials.length > 0) {
    where.material = { in: materials };
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {};
    if (priceMin !== undefined) where.price.gte = priceMin;
    if (priceMax !== undefined) where.price.lte = priceMax;
  }

  if (availability && availability.length > 0) {
    where.status = { in: availability };
  }

  if (colors && colors.length > 0) {
    where.variants = {
      some: {
        type: "warna_kain",
        label: { in: colors },
      },
    };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sort === "featured") {
    orderBy = { rating: "desc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  const skip = (page - 1) * pageSize;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    hasMore: skip + products.length < total,
  };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  limit: number = 3
): Promise<ProductWithDetails[]> {
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  });

  return prisma.product.findMany({
    where: {
      id: { not: productId },
      ...(currentProduct ? { categoryId: currentProduct.categoryId } : {}),
    },
    take: limit,
    orderBy: { rating: "desc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
}

export async function getCategoriesWithCount() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getFilterMetadata() {
  const [categories, allProducts, allVariants] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.product.findMany({
      select: {
        material: true,
        status: true,
        price: true,
      },
    }),
    prisma.productVariant.findMany({
      where: { type: "warna_kain" },
      select: { label: true, hexOrSwatch: true },
      distinct: ["label"],
    }),
  ]);

  const materialsMap = new Map<string, number>();
  const availabilityMap = new Map<string, number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of allProducts) {
    materialsMap.set(p.material, (materialsMap.get(p.material) || 0) + 1);
    availabilityMap.set(p.status, (availabilityMap.get(p.status) || 0) + 1);
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
  }

  return {
    categories,
    materials: Array.from(materialsMap.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    availability: Array.from(availabilityMap.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    colors: allVariants,
    priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
  };
}
