import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import ShopByRoom from "@/components/home/ShopByRoom";
import { getFeaturedProducts } from "@/lib/queries/product";

export const revalidate = 0; // Fresh database data

const testimonials = [
  {
    quote:
      "Astra Armchair yang saya pesan memiliki presisi sambungan kayu yang luar biasa rapi. Kain linen dan bantalan busanya sangat empuk untuk membaca santai berjam-jam.",
    author: "Amalia Wicaksono",
    location: "Kebayoran Baru, Jakarta Selatan",
    rating: 5,
  },
  {
    quote:
      "Meja makan Hikari solid teak langsung mengubah estetika ruang makan rumah kami menjadi lebih hangat dan tenang. Pengiriman dan perakitan tim Maison Lumina sangat profesional.",
    author: "Bambang Sudiro",
    location: "BSD City, Tangerang",
    rating: 5,
  },
  {
    quote:
      "Detail anyaman rotan pada credenza Enso sangat halus tanpa ada serat tajam. Terasa sekali komitmen craftsmanship artisanal berkualitas tinggi.",
    author: "Clarissa Tan",
    location: "Menteng, Jakarta Pusat",
    rating: 5,
  },
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <div className="flex flex-col w-full">
      {/* ═══════════════ 1. HERO SECTION ═══════════════ */}
      <section className="relative h-[80vh] min-h-[580px] max-h-[820px] w-full overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=85"
            alt="Maison Lumina - Keindahan Alami, Ketahanan Abadi"
            className="w-full h-full object-cover object-center"
          />
          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-dark/45 backdrop-brightness-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-xs tracking-wider uppercase font-medium mb-4">
              <Sparkles size={14} className="text-accent" />
              <span>Artisanal Teak &amp; Rattan Collection</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-5">
              Keindahan Alami, <br className="hidden sm:inline" />
              Ketahanan Abadi
            </h1>

            <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-xl font-sans">
              Koleksi furnitur artisanal yang memadukan kehangatan kayu jati solid legal dengan estetika Zen kontemporer untuk ketenangan ruang hidup Anda.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Button
                asChild
                size="lg"
                className="bg-accent text-white hover:bg-accent/90 px-8 py-6 text-sm font-semibold rounded-lg shadow-elevated"
              >
                <Link href="/koleksi" className="flex items-center justify-center gap-2">
                  <span>Jelajahi Koleksi</span>
                  <ArrowRight size={16} />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-sm font-semibold rounded-lg backdrop-blur-sm"
              >
                <Link href="#newsletter">
                  Lihat Lookbook
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 2. SHOP BY ROOM ═══════════════ */}
      <ShopByRoom />

      {/* ═══════════════ 3. KOLEKSI UNGGULAN ═══════════════ */}
      <section className="py-16 sm:py-24 bg-white border-y border-border-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
                PILIHAN KURATOR
              </p>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-dark">
                Koleksi Unggulan
              </h2>
            </div>
            <Button asChild variant="outline" className="border-border-soft text-dark hover:bg-background">
              <Link href="/koleksi" className="flex items-center gap-2 text-xs sm:text-sm">
                Lihat Semua Koleksi ({featuredProducts.length}+) <ArrowRight size={15} />
              </Link>
            </Button>
          </div>

          {/* Grid 4 Produk dari Prisma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. THE ARTISAN MANIFESTO ═══════════════ */}
      <section className="py-16 sm:py-24 bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Description & Stats */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                FILOSOFI KERAJINAN
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                The Artisan Manifesto
              </h2>

              <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                Setiap karya di Maison Lumina lahir dari rasa hormat mendalam terhadap alam. Kami menolak produksi massal demi merawat ketelitian sambungan purus, pasak kayu tradisional (mortise &amp; tenon), serta anyaman rotan alami yang diwariskan dari generasi ke generasi.
              </p>

              {/* Stats Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 text-accent mb-1.5">
                    <ShieldCheck size={20} />
                    <span className="text-xl sm:text-2xl font-bold font-serif text-white">100%</span>
                  </div>
                  <p className="text-xs text-white/80 font-medium">
                    Kayu Jati Padat Tersertifikasi Legal (FSC &amp; SVLK)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 text-accent mb-1.5">
                    <Award size={20} />
                    <span className="text-xl sm:text-2xl font-bold font-serif text-white">35+ Tahun</span>
                  </div>
                  <p className="text-xs text-white/80 font-medium">
                    Pengalaman Master Pengrajin Kayu Jepara
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="bg-accent text-white hover:bg-accent/90 px-6 py-5 rounded-lg text-sm font-semibold shadow-soft"
                >
                  <Link href="/craftsmanship" className="flex items-center gap-2">
                    <span>Pelajari Craftsmanship Kami</span>
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Collage of 3-4 Workshop Photos */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-card border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80"
                    alt="Pahat dan gergaji presisi pengrajin"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="aspect-[1/1] rounded-xl overflow-hidden shadow-card border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80"
                    alt="Anyaman tangan rotan alami"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                <div className="aspect-[1/1] rounded-xl overflow-hidden shadow-card border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"
                    alt="Tekstur serat kayu jati pilihan"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-card border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
                    alt="Finishing minyak alami non-toxic"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5. TESTIMONI ═══════════════ */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
              KEPUASAN KLIEN
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-dark">
              Cerita Dari Rumah Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-border-soft shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* 5 Stars */}
                  <div className="flex items-center gap-1 mb-4 text-[#D4AF37]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>

                  <p className="text-sm sm:text-base text-text-primary italic leading-relaxed mb-6 font-serif">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-border-soft/60">
                  <h4 className="font-sans text-sm font-bold text-dark">{t.author}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 6. NEWSLETTER ═══════════════ */}
      <section id="newsletter" className="py-16 sm:py-20 bg-white border-t border-border-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
            E-LOOKBOOK EKSKLUSIF
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-dark mb-4">
            Inspirasi Hunian Bernuansa Zen
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
            Daftarkan email Anda untuk menerima kurasi interior bulanan, e-lookbook edisi terbaru, serta penawaran rilis terbatas.
          </p>

          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan alamat email Anda"
              className="w-full h-11 px-4 text-sm rounded-lg border border-border-soft bg-background text-dark placeholder:text-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-dark"
              required
            />
            <Button
              type="submit"
              className="w-full sm:w-auto h-11 bg-dark text-white hover:bg-dark/90 px-6 text-sm font-semibold rounded-lg whitespace-nowrap shrink-0"
            >
              Unduh Lookbook
            </Button>
          </form>

          <div className="flex items-center justify-center gap-6 text-xs text-text-secondary mt-6">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent" /> Format PDF Resolusi Tinggi
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent" /> Tanpa Spam
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
