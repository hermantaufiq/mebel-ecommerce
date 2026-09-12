"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ProductWithDetails } from "@/lib/queries/product";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
  product: any;
  showQuickAdd?: boolean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = React.useState(false);
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isHeartActive = mounted ? isWishlisted(product.id) : false;

  const primaryImage =
    product.images && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0].url
      : "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80";

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: primaryImage,
        price: product.price,
        category: product.category?.name || "Furnitur",
        material: product.material,
        status: product.status,
        description: product.description,
        rating: product.rating,
      });
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  // Filter color swatches from variants
  const colorVariants =
    product.variants?.filter((v: any) => v.type === "warna_kain") || [];
  const displaySwatches = colorVariants.slice(0, 3);
  const remainingSwatchesCount = colorVariants.length - 3;

  const isReady = product.status === "Ready Stock";

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-border-soft hover:shadow-card transition-all duration-300 flex flex-col">
      {/* Image & Badges */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-background">
        <Link href={`/koleksi/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.images[0]?.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badge Status */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span
            className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold tracking-wide rounded-md uppercase ${
              isReady
                ? "bg-dark/90 text-white backdrop-blur-sm"
                : "bg-accent text-white"
            }`}
          >
            {product.status}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isHeartActive
              ? "bg-accent text-white shadow-sm"
              : "bg-white/90 text-text-secondary hover:bg-white hover:text-dark shadow-sm"
          }`}
          aria-label={isHeartActive ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
        >
          <Heart
            size={16}
            fill={isHeartActive ? "currentColor" : "none"}
            className="transition-transform active:scale-125"
          />
        </button>
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category • Material */}
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary font-medium mb-1 line-clamp-1">
            {product.category?.name || "Furnitur"}
            {product.material ? ` • ${product.material}` : ""}
          </p>

          {/* Product Name */}
          <Link href={`/koleksi/${product.slug}`} className="block group-hover:text-accent transition-colors">
            <h3 className="font-serif text-base sm:text-lg font-bold text-dark mb-2 line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Color Swatches */}
        <div className="flex items-center justify-between pt-2 border-t border-border-soft/60 mt-2">
          <p className="font-sans text-base sm:text-lg font-bold text-dark">
            {formatRupiah(product.price)}
          </p>

          {/* Swatches */}
          {displaySwatches.length > 0 && (
            <div className="flex items-center gap-1">
              {displaySwatches.map((variant: any) => (
                <span
                  key={variant.id}
                  title={variant.label}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-border-soft shadow-xs inline-block"
                  style={{ backgroundColor: variant.hexOrSwatch || "#D3C5B4" }}
                />
              ))}
              {remainingSwatchesCount > 0 && (
                <span className="text-[10px] text-text-secondary font-semibold ml-0.5">
                  +{remainingSwatchesCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
