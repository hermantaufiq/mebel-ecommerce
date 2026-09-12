import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/product";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export const revalidate = 0; // Fresh product details

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 3);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
