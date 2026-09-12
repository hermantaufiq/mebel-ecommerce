"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  Heart,
  ShoppingBag,
  Truck,
  Wrench,
  Minus,
  Plus,
  ArrowRight,
  Home,
  Check,
  Box,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductCard from "@/components/product/ProductCard";
import { ProductWithDetails } from "@/lib/queries/product";
import { formatRupiah, formatSimulasiCicilan } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductDetailClientProps {
  product: ProductWithDetails;
  relatedProducts: ProductWithDetails[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Variant selections
  const woodVariants =
    product.variants?.filter((v) => v.type === "material_kayu") || [];
  const fabricVariants =
    product.variants?.filter((v) => v.type === "warna_kain") || [];

  const [selectedWoodIndex, setSelectedWoodIndex] = React.useState(0);
  const [selectedFabricIndex, setSelectedFabricIndex] = React.useState(0);

  // Qty state
  const [qty, setQty] = React.useState(1);

  // Tabs state: 'deskripsi' | 'perawatan' | 'garansi'
  const [activeTab, setActiveTab] = React.useState<
    "deskripsi" | "perawatan" | "garansi"
  >("deskripsi");

  // Shipping simulation
  const [cityInput, setCityInput] = React.useState("");
  const [shippingResult, setShippingResult] = React.useState<string | null>(
    null
  );

  // Simulasi Modal
  const [simulasiOpen, setSimulasiOpen] = React.useState(false);

  // Cart & Wishlist Stores
  const addItem = useCartStore((s) => s.addItem);
  const isAdding = useCartStore((s) => s.isAdding);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const activeWood = woodVariants[selectedWoodIndex];
  const activeFabric = fabricVariants[selectedFabricIndex];
  const selectedVariantId = activeWood?.id || activeFabric?.id || null;
  const variantLabel =
    [activeWood?.label, activeFabric?.label].filter(Boolean).join(", ") ||
    undefined;
  const maxStock = activeWood?.stock ?? activeFabric?.stock ?? 10;

  // Price with variant offset
  const currentPrice =
    product.price +
    (activeWood?.priceOffset || 0) +
    (activeFabric?.priceOffset || 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = async () => {
    if (isAdding) return;
    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariantId,
        name: product.name,
        image:
          images[0]?.url ||
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
        unitPrice: currentPrice,
        qty,
        maxStock,
        material: product.material,
        variantLabel,
        slug: product.slug,
      });
      showToast(`✓ Berhasil menambahkan ${qty}x ${product.name} ke Keranjang!`);
    } catch {
      showToast("Terjadi kesalahan saat menambahkan ke keranjang.");
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleWishlist({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category?.name || "Furnitur",
        price: currentPrice,
        description: product.description,
        image:
          images[0]?.url ||
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
        material: product.material,
        status: product.status,
        rating: product.rating,
      });
      showToast(
        wishlisted
          ? "Produk dihapus dari Wishlist"
          : "✓ Berhasil ditambahkan ke Wishlist!"
      );
    } catch {
      // Fallback
    }
  };

  const handleCekOngkir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setShippingResult(
      `Estimasi ke ${cityInput}: Rp 0 (Gratis Ongkir & Pemasangan Jabodetabek)`
    );
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: "fallback",
            url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
            altText: product.name,
            sortOrder: 0,
          },
        ];

  const dimensions = product.dimensions as {
    panjang?: number;
    lebar?: number;
    tinggi?: number;
  } | null;

  const attributes = product.attributes as {
    tinggiDudukan?: string;
    materialBusa?: string;
    konstruksi?: string;
    finishing?: string;
  } | null;

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark text-white px-5 py-3 rounded-xl shadow-elevated border border-border-soft/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles size={16} className="text-accent shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Simulasi Cicilan Modal */}
      <Dialog open={simulasiOpen} onOpenChange={setSimulasiOpen}>
        <DialogContent className="max-w-md bg-background border border-border-soft">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-dark">
              Simulasi Cicilan 0%
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-xs text-text-secondary">
              Nikmati fasilitas cicilan 0% hingga 12 bulan menggunakan kartu kredit bank partner (BCA, Mandiri, BNI, CIMB Niaga).
            </p>
            <div className="space-y-2 border border-border-soft rounded-lg p-3 bg-white">
              {[3, 6, 12].map((tenor) => (
                <div
                  key={tenor}
                  className="flex items-center justify-between py-2 border-b border-border-soft/50 last:border-none text-xs"
                >
                  <span className="font-medium text-dark">{tenor} Bulan (0%)</span>
                  <span className="font-bold text-accent">
                    {formatRupiah(Math.round(currentPrice / tenor))} / bln
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-secondary/70">
              *Syarat dan ketentuan promo berlaku saat checkout pembayaran kartu kredit.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark flex items-center gap-1">
            <Home size={13} />
            <span>Beranda</span>
          </Link>
          <ChevronRight size={13} />
          <Link href="/koleksi" className="hover:text-dark">
            Koleksi
          </Link>
          {product.category && (
            <>
              <ChevronRight size={13} />
              <Link
                href={`/koleksi?category=${product.category.slug}`}
                className="hover:text-dark"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={13} />
          <span className="text-dark font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Hero: Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16">
          {/* 2. Galeri Foto */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-white border border-border-soft shadow-xs group">
              <img
                src={images[selectedImageIndex]?.url}
                alt={images[selectedImageIndex]?.altText || product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />

              {/* 360 View Ready Badge */}
              <div className="absolute top-4 left-4 bg-dark/85 backdrop-blur-sm text-white px-3 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase">
                360° VIEW READY
              </div>

              {/* AR Preview Action Button */}
              <div className="absolute bottom-4 right-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => showToast("Fitur AR Preview di Ruangan segera hadir!")}
                  className="bg-white/95 backdrop-blur-sm text-dark hover:bg-white text-xs font-semibold shadow-card border-border-soft flex items-center gap-1.5"
                >
                  <Box size={14} className="text-accent" />
                  <span>Lihat di Ruanganmu (AR Preview)</span>
                </Button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, index) => (
                  <button
                    key={img.id || index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === index
                        ? "border-accent ring-2 ring-accent/30 scale-102"
                        : "border-border-soft hover:border-text-secondary opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Info Produk, Varian, Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Status Badge & Category */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2.5 py-1 text-[11px] font-bold tracking-wide rounded uppercase ${
                    product.status === "Ready Stock"
                      ? "bg-dark text-white"
                      : "bg-accent text-white"
                  }`}
                >
                  {product.status}
                </span>

                <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
                  {product.category?.name} • {product.material}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-dark mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Rating + Review Count */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-[#D4AF37]">
                  <Star size={16} fill="currentColor" />
                </div>
                <span className="text-sm font-bold text-dark">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-text-secondary">
                  ({product.reviewCount} ulasan pembeli terverifikasi)
                </span>
              </div>

              {/* Price & Installment */}
              <div className="p-4 rounded-xl bg-white border border-border-soft mb-6">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-accent">
                    {formatRupiah(currentPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border-soft/60">
                  <span>
                    Cicilan 0% mulai {formatRupiah(Math.round(currentPrice / 12))}/bln (12x)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSimulasiOpen(true)}
                    className="text-dark font-semibold hover:text-accent underline"
                  >
                    Simulasi
                  </button>
                </div>
              </div>

              {/* 4. Pemilihan Varian */}
              <div className="space-y-5 mb-6">
                {/* Wood Variant */}
                {woodVariants.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-dark">
                        Pilihan Material Kayu:{" "}
                        <span className="font-bold text-accent">
                          {activeWood?.label}
                        </span>
                      </span>
                      {activeWood?.priceOffset ? (
                        <span className="text-text-secondary">
                          +{formatRupiah(activeWood.priceOffset)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      {woodVariants.map((wv, idx) => (
                        <button
                          key={wv.id}
                          type="button"
                          onClick={() => setSelectedWoodIndex(idx)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            selectedWoodIndex === idx
                              ? "border-dark ring-1 ring-dark bg-white text-dark font-bold"
                              : "border-border-soft bg-white/70 text-text-secondary hover:bg-white hover:text-dark"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-border-soft block"
                            style={{ backgroundColor: wv.hexOrSwatch || "#C19A6B" }}
                          />
                          <span>{wv.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fabric Variant */}
                {fabricVariants.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-dark">
                        Pilihan Warna Kain:{" "}
                        <span className="font-bold text-accent">
                          {activeFabric?.label}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {fabricVariants.map((fv, idx) => (
                        <button
                          key={fv.id}
                          type="button"
                          onClick={() => setSelectedFabricIndex(idx)}
                          title={fv.label}
                          className={`p-1 rounded-full border-2 transition-all ${
                            selectedFabricIndex === idx
                              ? "border-dark scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full border border-border-soft block shadow-xs"
                            style={{ backgroundColor: fv.hexOrSwatch || "#D3C5B4" }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Quantity & Actions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  {/* Stepper Qty */}
                  <div className="flex items-center border border-border-soft rounded-lg bg-white h-12 px-2">
                    <button
                      type="button"
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      disabled={qty <= 1}
                      className="p-1.5 text-text-secondary hover:text-dark disabled:opacity-40 disabled:hover:text-text-secondary transition-colors"
                      aria-label="Kurang kuantitas"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-dark">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((prev) => Math.min(maxStock, prev + 1))}
                      disabled={qty >= maxStock}
                      className="p-1.5 text-text-secondary hover:text-dark disabled:opacity-40 disabled:hover:text-text-secondary transition-colors"
                      aria-label="Tambah kuantitas"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Add to Cart (Dominant, Dark) */}
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || maxStock <= 0}
                    className="flex-1 h-12 bg-dark text-white hover:bg-dark/90 disabled:opacity-60 text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingBag size={18} />
                    <span>{isAdding ? "Menambahkan..." : "Tambah ke Keranjang"}</span>
                  </Button>

                  {/* Wishlist Button Outline */}
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-colors ${
                      wishlisted
                        ? "border-accent bg-accent text-white shadow-xs"
                        : "border-border-soft bg-white text-dark hover:bg-background"
                    }`}
                    aria-label="Simpan ke Wishlist"
                  >
                    <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Stock Warning/Notice */}
                {maxStock <= 0 ? (
                  <p className="text-xs font-semibold text-red-600">
                    Stok saat ini sedang habis untuk varian ini.
                  </p>
                ) : qty >= maxStock ? (
                  <p className="text-xs text-amber-700 font-medium">
                    Stok tersisa: {maxStock} unit (Kuantitas maksimal tercapai)
                  </p>
                ) : maxStock <= 5 ? (
                  <p className="text-xs text-amber-700 font-medium">
                    Stok terbatas: hanya tersisa {maxStock} unit
                  </p>
                ) : null}
              </div>

              {/* 6. Info Pengiriman & Cek Ongkir */}
              <div className="p-4 rounded-xl bg-white border border-border-soft space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-dark">
                  <Truck size={16} className="text-accent" />
                  <span>Estimasi Pengiriman Khusus: 2–4 Hari Kerja</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Wrench size={14} className="text-accent" />
                  <span>Jasa Perakitan di Tempat Gratis oleh Teknisi Ahli</span>
                </div>

                {/* Cek Ongkir Mock */}
                <form onSubmit={handleCekOngkir} className="flex gap-2 pt-2 border-t border-border-soft/60">
                  <Input
                    type="text"
                    placeholder="Masukkan Kota/Kecamatan Anda"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="h-9 text-xs bg-background border-border-soft"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs font-semibold border-border-soft whitespace-nowrap bg-white hover:bg-dark hover:text-white"
                  >
                    Cek Ongkir
                  </Button>
                </form>

                {shippingResult && (
                  <p className="text-xs font-medium text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                    {shippingResult}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Section Ergonomi & Proporsi */}
        {(dimensions || attributes) && (
          <section className="py-12 sm:py-16 border-t border-border-soft">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1.5">
                  DIMENSI &amp; MATERIAL
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-dark">
                  Ergonomi &amp; Proporsi Ruang
                </h2>
              </div>

              {/* Diagram Dimensi Sederhana */}
              {dimensions && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-soft mb-8 flex flex-col md:flex-row items-center justify-around gap-6">
                  <div className="relative w-48 h-36 border-2 border-dashed border-dark/30 rounded-lg flex items-center justify-center bg-background/60">
                    <div className="text-center">
                      <Layers size={28} className="mx-auto text-accent mb-1" />
                      <span className="text-xs font-serif font-bold text-dark">
                        Ilustrasi Skala
                      </span>
                    </div>
                    {/* Dimension Badges */}
                    <span className="absolute -top-3 px-2 py-0.5 bg-dark text-white rounded text-[10px] font-bold">
                      P: {dimensions.panjang} cm
                    </span>
                    <span className="absolute -right-3 px-2 py-0.5 bg-dark text-white rounded text-[10px] font-bold">
                      L: {dimensions.lebar} cm
                    </span>
                    <span className="absolute -bottom-3 px-2 py-0.5 bg-dark text-white rounded text-[10px] font-bold">
                      T: {dimensions.tinggi} cm
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-background border border-border-soft">
                      <span className="text-xs text-text-secondary block">Panjang</span>
                      <span className="font-serif text-lg font-bold text-dark">
                        {dimensions.panjang} cm
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border-soft">
                      <span className="text-xs text-text-secondary block">Lebar</span>
                      <span className="font-serif text-lg font-bold text-dark">
                        {dimensions.lebar} cm
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border-soft">
                      <span className="text-xs text-text-secondary block">Tinggi</span>
                      <span className="font-serif text-lg font-bold text-dark">
                        {dimensions.tinggi} cm
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Kartu Spesifikasi dari Attributes */}
              {attributes && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-white border border-border-soft">
                    <span className="text-xs font-semibold uppercase text-accent tracking-wider block mb-1">
                      Tinggi Dudukan
                    </span>
                    <p className="font-serif font-bold text-dark text-base">
                      {attributes.tinggiDudukan || "Ergonomis Standar"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Kenyamanan optimal untuk postur santai keluarga.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-white border border-border-soft">
                    <span className="text-xs font-semibold uppercase text-accent tracking-wider block mb-1">
                      Busa &amp; Bantalan
                    </span>
                    <p className="font-serif font-bold text-dark text-base">
                      {attributes.materialBusa || "Busa Berkepadatan Tinggi"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Tahan kempis dengan daya lentur kenyamanan jangka panjang.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-white border border-border-soft">
                    <span className="text-xs font-semibold uppercase text-accent tracking-wider block mb-1">
                      Konstruksi Rangka
                    </span>
                    <p className="font-serif font-bold text-dark text-base">
                      {attributes.konstruksi || "Solid Mortise & Tenon Joint"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Kekuatan sambungan kayu presisi tanpa goyang.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 8. Tabs: Deskripsi, Perawatan, Garansi */}
        <section className="py-12 border-t border-border-soft">
          <div className="max-w-4xl mx-auto">
            {/* Tab Headers */}
            <div className="flex border-b border-border-soft mb-6 overflow-x-auto">
              {[
                { key: "deskripsi", label: "Deskripsi Detail" },
                { key: "perawatan", label: "Perawatan Material" },
                { key: "garansi", label: "Pengiriman & Garansi" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "border-dark text-dark"
                      : "border-transparent text-text-secondary hover:text-dark"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border-soft text-sm sm:text-base leading-relaxed text-text-primary">
              {activeTab === "deskripsi" && (
                <div className="space-y-4">
                  <p>{product.description}</p>
                  <p className="text-sm text-text-secondary">
                    Setiap unit diproduksi secara teliti oleh pengrajin berpengalaman di sentra mebel Jepara dengan mengutamakan standar ekspor dan finishing yang aman bagi keluarga.
                  </p>
                </div>
              )}

              {activeTab === "perawatan" && (
                <div className="space-y-4 text-sm">
                  <h4 className="font-serif font-bold text-dark text-base">
                    Panduan Perawatan Kayu Jati &amp; Rotan Alami
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li>
                      Bersihkan debu secara berkala menggunakan kain microfiber kering atau sedikit lembap.
                    </li>
                    <li>
                      Hindari paparan sinar matahari langsung dan genangan cairan dalam waktu lama.
                    </li>
                    <li>
                      Untuk merawat kilau alami kayu jati, Anda dapat mengaplikasikan teak oil alami setiap 6–12 bulan sekali.
                    </li>
                    <li>
                      Kain linen/bouclé dapat dibersihkan dengan vacuum cleaner berdaya hisap rendah atau spot-cleaning sabun netral.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "garansi" && (
                <div className="space-y-4 text-sm">
                  <h4 className="font-serif font-bold text-dark text-base">
                    Jaminan Kualitas &amp; Layanan Pengantaran
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    <li>
                      <strong>Garansi Rangka 5 Tahun:</strong> Menjamin perbaikan atau penggantian apabila terjadi kerusakan struktural sambungan kayu alami.
                    </li>
                    <li>
                      <strong>Pengiriman Khusus Furniture:</strong> Dihantarkan langsung oleh armada khusus Maison Lumina demi menjaga integritas barang.
                    </li>
                    <li>
                      <strong>Gratis Pemasangan &amp; Unboxing:</strong> Teknisi kami akan merakit dan menempatkan furnitur langsung di ruangan pilihan Anda.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 9. Kurasi Serasi (Related Products) */}
        {relatedProducts.length > 0 && (
          <section className="py-16 sm:py-20 border-t border-border-soft">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1.5">
                PADUAN SEMPURNA
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-dark">
                Kurasi Serasi
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
