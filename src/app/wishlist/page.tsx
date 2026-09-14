"use client";

import * as React from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { useWishlistStore, type WishlistItem } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SortOption = "terbaru" | "harga_terendah" | "harga_tertinggi";

const sortLabels: Record<SortOption, string> = {
  terbaru: "Terbaru Ditambahkan",
  harga_terendah: "Harga Terendah",
  harga_tertinggi: "Harga Tertinggi",
};

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const [activeFilter, setActiveFilter] = React.useState("Semua");
  const [sortBy, setSortBy] = React.useState<SortOption>("terbaru");
  const [sortOpen, setSortOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categoryFilters = React.useMemo(() => {
    const counts: Record<string, number> = { Semua: items.length };
    items.forEach((p) => {
      const cat = p.category || "Furnitur";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [items]);

  const filteredAndSortedItems = React.useMemo(() => {
    let result = [...items];

    // Filter by category
    if (activeFilter !== "Semua") {
      result = result.filter((p) => {
        const cat = p.category || "Furnitur";
        return cat === activeFilter;
      });
    }

    // Sort
    switch (sortBy) {
      case "harga_terendah":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "harga_tertinggi":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "terbaru":
      default:
        // Keep original order (most recently added last, so reverse)
        result.reverse();
        break;
    }

    return result;
  }, [items, activeFilter, sortBy]);

  const handleAddToCart = async (product: WishlistItem) => {
    try {
      await addItem({
        productId: product.productId,
        variantId: null,
        name: product.name,
        image: product.image,
        unitPrice: product.price,
        qty: 1,
        maxStock: 10,
        material: product.material,
        slug: product.slug,
      });
      showToast(`✓ Berhasil menambahkan ${product.name} ke Keranjang!`);
    } catch {
      showToast("Gagal menambahkan ke keranjang.");
    }
  };

  const handleMoveAllToCart = async () => {
    if (items.length === 0) return;
    for (const p of items) {
      try {
        await addItem({
          productId: p.productId,
          variantId: null,
          name: p.name,
          image: p.image,
          unitPrice: p.price,
          qty: 1,
          maxStock: 10,
          material: p.material,
          slug: p.slug,
        });
      } catch {
        // continue
      }
    }
    showToast(`✓ Berhasil memindahkan ${items.length} item ke Keranjang!`);
  };

  if (!mounted) {
    return (
      <div className="w-full bg-background min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border-soft/40 rounded w-48" />
            <div className="h-4 bg-border-soft/40 rounded w-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen py-8 sm:py-12">
      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark text-white px-5 py-3 rounded-xl shadow-elevated border border-border-soft flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles size={16} className="text-accent" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-1.5">
            KOLEKSI PRIBADI
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-dark mb-2">
            Wishlist Anda
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl">
            Simpan dan organisasikan karya furnitur pilihan yang menginspirasi hunian Anda. Pindahkan ke keranjang belanja kapan saja.
          </p>
        </div>

        {/* Toolbar: Category Chips + Sort + Move All Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border-soft">
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map(({ label, count }) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveFilter(label)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  activeFilter === label
                    ? "bg-dark text-white shadow-xs"
                    : "bg-white text-text-secondary border border-border-soft hover:bg-background hover:text-dark"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border-soft rounded-full bg-white text-text-secondary hover:text-dark transition-colors"
              >
                <ArrowUpDown size={13} />
                <span>{sortLabels[sortBy]}</span>
                <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-border-soft rounded-lg shadow-card z-20 min-w-[180px] py-1">
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSortBy(key);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        sortBy === key
                          ? "bg-dark/5 text-dark font-bold"
                          : "text-text-secondary hover:bg-background hover:text-dark"
                      }`}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs sm:text-sm text-text-secondary">
              Total: <strong className="text-dark">{items.length} Item</strong>
            </span>
            {items.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleMoveAllToCart}
                className="bg-dark text-white hover:bg-dark/90 text-xs font-semibold flex items-center gap-1.5"
              >
                <ShoppingBag size={14} />
                <span>Pindahkan Semua ke Keranjang</span>
              </Button>
            )}
          </div>
        </div>

        {/* Wishlist Items Grid */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border-soft p-8">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-4 border border-border-soft">
              <Heart size={28} className="text-text-secondary" />
            </div>
            <h3 className="font-serif text-xl font-bold text-dark mb-2">
              {activeFilter !== "Semua"
                ? `Tidak ada item "${activeFilter}" di Wishlist`
                : "Wishlist Anda Masih Kosong"}
            </h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
              Jelajahi koleksi kami dan tekan ikon hati pada produk yang Anda sukai.
            </p>
            <Button asChild className="bg-dark text-white hover:bg-dark/90 text-sm px-6">
              <Link href="/koleksi" className="flex items-center gap-2">
                <span>Jelajahi Katalog Koleksi</span>
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {filteredAndSortedItems.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-border-soft overflow-hidden flex flex-col sm:flex-row hover:shadow-xs transition-shadow"
              >
                {/* Image */}
                <Link
                  href={`/koleksi/${product.slug}`}
                  className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative bg-background block"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded bg-dark/90 text-white backdrop-blur-xs">
                    {product.status || "Ready Stock"}
                  </span>
                </Link>

                {/* Info */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold">
                        {product.category || "Furnitur"}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.productId)}
                        className="text-text-secondary hover:text-red-500 transition-colors p-1"
                        aria-label="Hapus dari wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <Link href={`/koleksi/${product.slug}`} className="block group">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-dark group-hover:text-accent transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-soft/60 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-text-secondary block">
                        Harga
                      </span>
                      <span className="font-sans font-bold text-dark text-base sm:text-lg">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="bg-dark text-white hover:bg-dark/90 text-xs font-semibold px-4 flex items-center gap-1.5"
                    >
                      <ShoppingBag size={13} />
                      <span>+ Keranjang</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
