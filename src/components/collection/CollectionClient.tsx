"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Filter,
  X,
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProductCard from "@/components/product/ProductCard";
import { ProductWithDetails } from "@/lib/queries/product";
import { formatRupiah } from "@/lib/utils";

interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  room: string;
  _count: { products: number };
}

interface FilterMeta {
  categories: CategoryMeta[];
  materials: { name: string; count: number }[];
  availability: { status: string; count: number }[];
  colors: { label: string; hexOrSwatch: string | null }[];
  priceRange: { min: number; max: number };
}

interface CollectionClientProps {
  initialProducts: ProductWithDetails[];
  totalCount: number;
  metadata: FilterMeta;
  activeRoom?: string;
}

export default function CollectionClient({
  initialProducts,
  totalCount,
  metadata,
  activeRoom,
}: CollectionClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  // Pagination "Muat Lebih Banyak" state (initial 6 or 12, loads 6 more per click)
  const [visibleCount, setVisibleCount] = React.useState(6);

  // Read current filters from URL
  const selectedCategory = searchParams.get("category") || "";
  const selectedRoom = searchParams.get("room") || activeRoom || "";
  const selectedMaterials = searchParams.getAll("material");
  const selectedAvailability = searchParams.getAll("status");
  const selectedColors = searchParams.getAll("color");
  const priceMinParam = searchParams.get("priceMin") || "";
  const priceMaxParam = searchParams.get("priceMax") || "";
  const currentSort = searchParams.get("sort") || "featured";

  // Local state for price inputs to prevent lagging
  const [minPriceInput, setMinPriceInput] = React.useState(priceMinParam);
  const [maxPriceInput, setMaxPriceInput] = React.useState(priceMaxParam);

  React.useEffect(() => {
    setMinPriceInput(priceMinParam);
    setMaxPriceInput(priceMaxParam);
  }, [priceMinParam, priceMaxParam]);

  // Update URL helper
  const updateUrl = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      params.delete(key);
      if (val !== null && val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach((item) => {
            if (item) params.append(key, item);
          });
        } else if (val !== "") {
          params.set(key, val);
        }
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryToggle = (slug: string) => {
    const newCategory = selectedCategory === slug ? null : slug;
    updateUrl({ category: newCategory });
  };

  const handleMaterialToggle = (material: string) => {
    const newMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material];
    updateUrl({ material: newMaterials });
  };

  const handleAvailabilityToggle = (status: string) => {
    const newAvail = selectedAvailability.includes(status)
      ? selectedAvailability.filter((s) => s !== status)
      : [...selectedAvailability, status];
    updateUrl({ status: newAvail });
  };

  const handleColorToggle = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    updateUrl({ color: newColors });
  };

  const handlePriceApply = () => {
    updateUrl({
      priceMin: minPriceInput ? minPriceInput : null,
      priceMax: maxPriceInput ? maxPriceInput : null,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ sort: e.target.value });
  };

  const handleResetAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedRoom) ||
    selectedMaterials.length > 0 ||
    selectedAvailability.length > 0 ||
    selectedColors.length > 0 ||
    Boolean(priceMinParam) ||
    Boolean(priceMaxParam);

  // Dynamic Title & Breadcrumb calculation
  const title = selectedRoom
    ? `Koleksi ${selectedRoom.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
    : selectedCategory
    ? metadata.categories.find((c) => c.slug === selectedCategory)?.name || "Koleksi Produk"
    : "Semua Koleksi";

  // Products to display with "Muat Lebih Banyak"
  const displayedProducts = initialProducts.slice(0, visibleCount);
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, initialProducts.length));
  };

  // Reusable Filter Sidebar Content
  const filterSidebarContent = (
    <div className="space-y-8 text-sm">
      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <div className="pb-4 border-b border-border-soft">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="w-full flex items-center justify-center gap-2 border-border-soft text-accent hover:bg-accent/5 hover:text-accent font-medium text-xs"
          >
            <RotateCcw size={14} />
            <span>Reset Semua Filter</span>
          </Button>
        </div>
      )}

      {/* 1. Tipe Produk / Kategori */}
      <div>
        <h4 className="font-serif font-bold text-dark text-base mb-3.5 tracking-wide">
          Tipe Produk
        </h4>
        <div className="space-y-2.5">
          {metadata.categories.map((cat) => {
            const isChecked = selectedCategory === cat.slug;
            return (
              <label
                key={cat.id}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="w-4 h-4 rounded border-border-soft text-dark focus:ring-dark cursor-pointer accent-dark"
                  />
                  <span
                    className={`text-sm group-hover:text-dark transition-colors ${
                      isChecked
                        ? "font-semibold text-dark"
                        : "text-text-secondary"
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs text-text-secondary/70">
                  ({cat._count.products})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Material */}
      <div className="pt-6 border-t border-border-soft">
        <h4 className="font-serif font-bold text-dark text-base mb-3.5 tracking-wide">
          Material
        </h4>
        <div className="space-y-2.5">
          {metadata.materials.map((m) => {
            const isChecked = selectedMaterials.includes(m.name);
            return (
              <label
                key={m.name}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMaterialToggle(m.name)}
                    className="w-4 h-4 rounded border-border-soft text-dark focus:ring-dark cursor-pointer accent-dark"
                  />
                  <span
                    className={`text-sm group-hover:text-dark transition-colors ${
                      isChecked
                        ? "font-semibold text-dark"
                        : "text-text-secondary"
                    }`}
                  >
                    {m.name}
                  </span>
                </div>
                <span className="text-xs text-text-secondary/70">
                  ({m.count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Rentang Harga */}
      <div className="pt-6 border-t border-border-soft">
        <h4 className="font-serif font-bold text-dark text-base mb-3.5 tracking-wide">
          Rentang Harga
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-text-secondary mb-1 block">
                Min (Rp)
              </span>
              <Input
                type="number"
                placeholder="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="h-9 text-xs bg-white border-border-soft"
              />
            </div>
            <div>
              <span className="text-[11px] text-text-secondary mb-1 block">
                Maks (Rp)
              </span>
              <Input
                type="number"
                placeholder={metadata.priceRange.max.toString()}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="h-9 text-xs bg-white border-border-soft"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePriceApply}
            className="w-full text-xs font-semibold h-8 bg-white hover:bg-dark hover:text-white border-border-soft transition-colors"
          >
            Terapkan Harga
          </Button>
        </div>
      </div>

      {/* 4. Ketersediaan */}
      <div className="pt-6 border-t border-border-soft">
        <h4 className="font-serif font-bold text-dark text-base mb-3.5 tracking-wide">
          Ketersediaan
        </h4>
        <div className="space-y-2.5">
          {metadata.availability.map((av) => {
            const isChecked = selectedAvailability.includes(av.status);
            return (
              <label
                key={av.status}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAvailabilityToggle(av.status)}
                    className="w-4 h-4 rounded border-border-soft text-dark focus:ring-dark cursor-pointer accent-dark"
                  />
                  <span
                    className={`text-sm group-hover:text-dark transition-colors ${
                      isChecked
                        ? "font-semibold text-dark"
                        : "text-text-secondary"
                    }`}
                  >
                    {av.status}
                  </span>
                </div>
                <span className="text-xs text-text-secondary/70">
                  ({av.count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Pilihan Warna */}
      <div className="pt-6 border-t border-border-soft">
        <h4 className="font-serif font-bold text-dark text-base mb-3.5 tracking-wide">
          Pilihan Warna Kain
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {metadata.colors.map((c) => {
            const isSelected = selectedColors.includes(c.label);
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => handleColorToggle(c.label)}
                title={c.label}
                className={`relative group/color p-0.5 rounded-full transition-transform ${
                  isSelected
                    ? "ring-2 ring-dark scale-110"
                    : "hover:scale-105"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full border border-border-soft block shadow-xs"
                  style={{ backgroundColor: c.hexOrSwatch || "#C19A6B" }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-6 sm:mb-8">
          <Link href="/" className="hover:text-dark flex items-center gap-1">
            <Home size={13} />
            <span>Beranda</span>
          </Link>
          <ChevronRight size={13} />
          <Link
            href="/koleksi"
            className={!selectedRoom ? "text-dark font-semibold" : "hover:text-dark"}
          >
            Koleksi
          </Link>
          {selectedRoom && (
            <>
              <ChevronRight size={13} />
              <span className="text-dark font-semibold capitalize">
                {selectedRoom.replace("-", " ")}
              </span>
            </>
          )}
        </nav>

        {/* Title & Description */}
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
            Eksplorasi mahakarya furnitur kayu jati solid dan rotan artisanal berkualitas premium yang dirancang untuk kenyamanan tahan lama.
          </p>
        </div>

        {/* Toolbar Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-4 bg-white rounded-xl border border-border-soft mb-8">
          {/* Mobile Filter Trigger Button */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="lg:hidden">
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-border-soft text-dark"
                  >
                    <SlidersHorizontal size={15} />
                    <span>Filter</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[310px] sm:w-[380px] p-6 bg-background overflow-y-auto"
                >
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle className="font-serif text-xl font-bold text-dark">
                      Filter Produk
                    </SheetTitle>
                  </SheetHeader>
                  {filterSidebarContent}
                </SheetContent>
              </Sheet>
            </div>

            {/* Total Count Text */}
            <p className="text-xs sm:text-sm text-text-secondary font-medium">
              Menampilkan{" "}
              <span className="text-dark font-bold">
                1–{Math.min(visibleCount, initialProducts.length)}
              </span>{" "}
              dari{" "}
              <span className="text-dark font-bold">
                {initialProducts.length}
              </span>{" "}
              produk
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs sm:text-sm text-text-secondary whitespace-nowrap">
              Urutkan:
            </span>
            <div className="relative">
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="appearance-none bg-background border border-border-soft text-dark text-xs sm:text-sm font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-dark cursor-pointer"
              >
                <option value="featured">Unggulan</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="newest">Terbaru</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-border-soft h-fit sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-soft">
              <h3 className="font-serif font-bold text-dark text-lg">Filter</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-accent hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>
            {filterSidebarContent}
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9 flex flex-col">
            {initialProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-border-soft text-center my-8">
                <p className="font-serif text-xl font-bold text-dark mb-2">
                  Tidak Ada Produk yang Sesuai
                </p>
                <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                  Coba ubah kriteria filter Anda atau tekan tombol reset di bawah untuk melihat seluruh koleksi kami.
                </p>
                <Button
                  onClick={handleResetAll}
                  className="bg-dark text-white hover:bg-dark/90 text-sm"
                >
                  Reset Semua Filter
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination "Muat Lebih Banyak Produk" */}
                {visibleCount < initialProducts.length && (
                  <div className="mt-14 text-center">
                    <p className="text-xs text-text-secondary mb-3">
                      Menampilkan {visibleCount} dari {initialProducts.length} produk
                    </p>
                    <div className="w-48 h-1.5 bg-border-soft rounded-full mx-auto mb-4 overflow-hidden">
                      <div
                        className="h-full bg-dark rounded-full transition-all duration-300"
                        style={{
                          width: `${(visibleCount / initialProducts.length) * 100}%`,
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      className="border-border-soft text-dark hover:bg-white px-8 py-5 text-sm font-semibold rounded-lg shadow-xs"
                    >
                      Muat Lebih Banyak Produk
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
