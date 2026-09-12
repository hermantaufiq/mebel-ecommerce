import { Suspense } from "react";
import {
  getProductsByCategory,
  getFilterMetadata,
  ProductFilterParams,
} from "@/lib/queries/product";
import CollectionClient from "@/components/collection/CollectionClient";

export const revalidate = 0; // Ensure fresh data on every filter change

interface KoleksiPageProps {
  searchParams: {
    category?: string;
    room?: string;
    material?: string | string[];
    status?: string | string[];
    color?: string | string[];
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  };
}

export default async function KoleksiPage({ searchParams }: KoleksiPageProps) {
  const materials = Array.isArray(searchParams.material)
    ? searchParams.material
    : searchParams.material
    ? [searchParams.material]
    : undefined;

  const availability = Array.isArray(searchParams.status)
    ? searchParams.status
    : searchParams.status
    ? [searchParams.status]
    : undefined;

  const colors = Array.isArray(searchParams.color)
    ? searchParams.color
    : searchParams.color
    ? [searchParams.color]
    : undefined;

  const priceMin = searchParams.priceMin ? parseInt(searchParams.priceMin, 10) : undefined;
  const priceMax = searchParams.priceMax ? parseInt(searchParams.priceMax, 10) : undefined;

  const filters: ProductFilterParams = {
    categorySlug: searchParams.category,
    room: searchParams.room,
    materials,
    availability,
    colors,
    priceMin,
    priceMax,
    sort: searchParams.sort || "featured",
    page: 1,
    pageSize: 40,
  };

  const [{ products, total }, metadata] = await Promise.all([
    getProductsByCategory(filters),
    getFilterMetadata(),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-12 text-dark font-serif">Memuat Katalog Koleksi...</div>}>
      <CollectionClient
        initialProducts={products}
        totalCount={total}
        metadata={metadata}
        activeRoom={searchParams.room}
      />
    </Suspense>
  );
}
