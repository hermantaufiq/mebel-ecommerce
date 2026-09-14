'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Hammer, Shield, Droplets } from 'lucide-react';

export default function CraftsmanshipPage() {
  return (
    <div className="page-fade-in">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-brand-dark flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1622201426167-3ae49d0a5a63?w=1400&q=80"
          alt="Pengrajin kayu Maison Lumina"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative text-center px-4 max-w-2xl">
          <p className="text-xs tracking-[0.25em] uppercase text-brand-accent mb-4">SENI & WARISAN</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-bold mb-4 leading-tight">
            The Soul of Wood
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Keunggulan struktural berpadu dengan keindahan estetika abadi. Setiap goresan pahat menceritakan dedikasi tanpa kompromi.
          </p>
        </div>
      </section>

      {/* ═══════════════ KURASI MATERIAL ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-brand-accent mb-3">KURASI MATERIAL</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-6 leading-tight">
              Kayu Jati Pilihan Berkelanjutan
            </h2>
            <p className="text-sm text-brand-muted leading-relaxed mb-8">
              Kami hanya memilih kayu jati perhutani tua pilihan yang telah melalui proses pengeringan alami (kiln-dry) selama beratus-tahun. Kepadatan serat dan kadar minyak alaminya menjamin ketahanan terhadap perubahan cuaca ekstrem tanpa mengorbankan kehalusan tekstur alami.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-brand-border rounded-xl p-5">
                <p className="font-serif text-2xl font-bold text-brand-dark mb-1">30+ Tahun</p>
                <p className="text-xs text-brand-muted">Usia minimal pohon jati yang digunakan secara legal & lestari.</p>
              </div>
              <div className="bg-white border border-brand-border rounded-xl p-5">
                <p className="font-serif text-2xl font-bold text-brand-dark mb-1">8-10%</p>
                <p className="text-xs text-brand-muted">Kadar air optimal pasca pengeringan untuk stabilitas maksimal.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"
              alt="Tekstur kayu jati close-up"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ TEKNIK KONSTRUKSI ═══════════════ */}
      <section className="bg-brand-subtle py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-brand-accent mb-2">TEKNIK KONSTRUKSI</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-3">
              Mortise &amp; Tenon Abadi
            </h2>
            <p className="text-sm text-brand-muted max-w-lg mx-auto">
              Warisan teknik tukang kayu klasik tanpa paku logam, menciptakan ikatan struktural yang semakin kokoh seiring berjalannya waktu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-brand-border text-center">
              <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mx-auto mb-4">
                <Hammer size={22} className="text-brand-accent" />
              </div>
              <h3 className="font-semibold text-sm text-brand-dark mb-2">Presisi Lubang & Lidah</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Sambungan mortise dan tenon dipahat dengan toleransi milimeter untuk mengunci secara sempurna di setiap titik tekanan.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-brand-border text-center">
              <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mx-auto mb-4">
                <Shield size={22} className="text-brand-accent" />
              </div>
              <h3 className="font-semibold text-sm text-brand-dark mb-2">Perekat Alami Ramah Lingkungan</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Menggunakan lem berbasis resin organik berkualitas tinggi yang menyatu dengan serat kayu tanpa emisi kimia berbahaya.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-brand-border text-center">
              <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={22} className="text-brand-accent" />
              </div>
              <h3 className="font-semibold text-sm text-brand-dark mb-2">Uji Ketahanan Struktural</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Setiap rangka kursi dan meja melewati simulasi beban dinamis untuk memastikan ketahanan hingga puluhan tahun penggunaan harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINISHING NATURAL ═══════════════ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1622201426167-3ae49d0a5a63?w=800&q=80"
              alt="Pengrajin finishing kayu"
              className="w-full h-[400px] object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs tracking-[0.2em] uppercase text-brand-accent mb-3">FINISHING NATURAL</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-6 leading-tight">
              Sentuhan Tangan yang Menghidupkan Serat
            </h2>
            <p className="text-sm text-brand-muted leading-relaxed mb-6">
              Kami menghindari lapisan cat sintetis tebal yang menutup pori-pori kayu. Proses finishing menggunakan minyak nabati murni dan beeswax alami yang meresap ke dalam, membiarkan Anda merasakan tekstur asli kayu jati di setiap sentuhan.
            </p>
            <ul className="space-y-3">
              {[
                'Bebas VOC & bahan kimia toksik',
                'Permukaan breathable yang tahan noda air ringan',
                'Mudah dirawat dan dapat diperbarui kembali',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-brand-dark">
                  <CheckCircle2 size={16} className="text-brand-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════ GALERI WORKSHOP ═══════════════ */}
      <section className="bg-brand-soft py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-brand-accent mb-2">WORKSHOP KAMI</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-3">
              Galeri Pengrajin Lokal
            </h2>
            <p className="text-sm text-brand-muted max-w-lg mx-auto">
              Saksikan bagaimana tangan-tangan maestro Jepara mengubah balok kayu mentah menjadi mahakarya fungsional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', caption: 'Pemeriksaan Detail Manual' },
              { src: 'https://images.unsplash.com/photo-1622201426167-3ae49d0a5a63?w=600&q=80', caption: 'Teknik Pengeringan Kayu' },
              { src: 'https://images.unsplash.com/photo-1616627577385-5c0c4dab55a1?w=600&q=80', caption: 'Perakitan Rangka Presisi' },
            ].map((img, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden group">
                <img src={img.src} alt={img.caption} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-4 left-4 text-white text-sm font-medium">{img.caption}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/koleksi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-brand-hoverAccent transition-colors"
            >
              Jelajahi Koleksi Crafted Kami <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
