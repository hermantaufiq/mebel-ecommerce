'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, X, RotateCw, Save, Grid3X3, ShoppingBag, Search, Phone, Download } from 'lucide-react';
import { useRoomPlannerStore } from '@/store/roomPlannerStore';
import { useCartStore } from '@/store/cartStore';
import { products } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';

const roomTabs = [
  { key: 'ruang-tamu' as const, label: 'Ruang Tamu' },
  { key: 'kamar-tidur' as const, label: 'Kamar Tidur' },
  { key: 'ruang-makan' as const, label: 'Ruang Makan Zen' },
];

const categoryTabs = ['Semua', 'Duduk', 'Meja', 'Dekor'];

export default function RoomPlannerPage() {
  const { roomType, placedItems, showGrid, setRoomType, addToCanvas, removeFromCanvas, resetCanvas, toggleGrid, getItemCount, getTotalEstimate } = useRoomPlannerStore();
  const addItem = useCartStore((s) => s.addItem);
  const [activeCat, setActiveCat] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const catalogProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCat === 'Semua') return matchSearch;
    if (activeCat === 'Duduk') return matchSearch && ['cat-1', 'cat-2'].includes(p.categoryId);
    if (activeCat === 'Meja') return matchSearch && ['cat-3', 'cat-4', 'cat-6', 'cat-8'].includes(p.categoryId);
    if (activeCat === 'Dekor') return matchSearch && ['cat-9', 'cat-10'].includes(p.categoryId);
    return matchSearch;
  }).slice(0, 8);

  const handleBuyAll = async () => {
    for (const item of placedItems) {
      await addItem({
        productId: item.product.id,
        variantId: null,
        name: item.product.name,
        image: item.product.images?.[0]?.url || '/placeholder.png',
        unitPrice: item.product.price,
        qty: 1,
        maxStock: 99,
        material: item.product.material,
        slug: item.product.slug,
      });
    }
  };

  return (
    <div className="page-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-brand-muted mb-6">
          <Link href="/" className="hover:text-brand-accent transition-colors">BERANDA</Link>
          <ChevronRight size={12} />
          <span className="text-brand-dark font-semibold">ROOM PLANNER / VISUALIZER RUANGAN</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-2">Studio Ruang Virtual</h1>
            <p className="text-sm text-brand-muted max-w-lg">
              Rancang tata letak ruangan impian Anda dengan koleksi furniture butik Maison Lumina. Letakkan, sesuaikan, dan wujudkan keindahan interior rumah Anda.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetCanvas}
              className="px-4 py-2.5 text-sm font-medium border border-brand-border rounded-lg text-brand-dark hover:bg-brand-soft transition-colors flex items-center gap-2"
            >
              <RotateCw size={14} /> Atur Ulang
            </button>
            <button className="px-4 py-2.5 text-sm font-semibold bg-brand-dark text-white rounded-lg hover:bg-brand-hoverDark transition-colors flex items-center gap-2">
              <Save size={14} /> Simpan Desain
            </button>
          </div>
        </div>

        {/* Main planner area */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Sidebar catalog */}
          <div className="lg:w-72 flex-shrink-0 bg-white rounded-xl border border-brand-border p-5">
            <h3 className="font-semibold text-sm text-brand-dark mb-3">Katalog Produk</h3>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    activeCat === cat
                      ? 'bg-brand-dark text-white'
                      : 'bg-brand-bg text-brand-muted hover:bg-brand-soft'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                placeholder="Cari kursi, sofa, meja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {catalogProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-bg transition-colors">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-brand-soft flex-shrink-0">
                    <img src={p.images[0]?.url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-brand-accent font-semibold">{p.categoryName}</p>
                    <p className="text-xs font-semibold text-brand-dark truncate">{p.name}</p>
                    <p className="text-xs text-brand-muted">{formatRupiah(p.price)}</p>
                  </div>
                  <button
                    onClick={() => addToCanvas(p)}
                    className="w-7 h-7 rounded-full bg-brand-dark text-white flex items-center justify-center hover:bg-brand-hoverDark transition-colors flex-shrink-0"
                    aria-label={`Tambahkan ${p.name} ke kanvas`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1">
            {/* Room type tabs */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-wider">TIPE RUANGAN:</span>
              <div className="flex gap-2">
                {roomTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRoomType(tab.key)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      roomType === tab.key
                        ? 'bg-brand-dark text-white'
                        : 'bg-white text-brand-muted border border-brand-border hover:border-brand-dark'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleGrid}
                className={`ml-auto flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  showGrid ? 'text-brand-dark' : 'text-brand-muted'
                }`}
              >
                <Grid3X3 size={14} /> Grid Aktif (1:20)
              </button>
            </div>

            {/* Canvas */}
            <div className={`relative bg-white border-2 border-dashed border-brand-border rounded-xl min-h-[400px] lg:min-h-[480px] ${showGrid ? 'canvas-grid' : ''}`}>
              {placedItems.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-muted">
                      <path d="M3 21V7l9-4 9 4v14" /><path d="M9 21V13h6v8" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark mb-2">Ruangan Anda Masih Kosong</h3>
                  <p className="text-xs text-brand-muted max-w-xs">
                    Klik tombol tambah (+) pada katalog di sebelah kiri untuk mulai menempatkan furniture ke dalam denah.
                  </p>
                </div>
              ) : (
                placedItems.map((item) => (
                  <div
                    key={item.instanceId}
                    className="absolute group cursor-move"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-brand-soft border-2 border-brand-dark/20 shadow-card">
                        <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => removeFromCanvas(item.instanceId)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Hapus item"
                      >
                        <X size={10} />
                      </button>
                      <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-brand-dark whitespace-nowrap bg-white/90 px-1 rounded">
                        {item.product.name.split(' ').slice(0, 2).join(' ')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer panel */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-4 bg-white rounded-xl border border-brand-border">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-brand-accent font-semibold">ITEM TERPASANG</p>
                  <p className="text-sm font-bold text-brand-dark">{getItemCount()} Item</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-brand-accent font-semibold">TOTAL ESTIMASI SET</p>
                  <p className="text-sm font-bold text-brand-dark">{formatRupiah(getTotalEstimate())}</p>
                </div>
              </div>
              <button
                onClick={handleBuyAll}
                disabled={placedItems.length === 0}
                className="px-5 py-2.5 bg-brand-dark text-white text-sm font-semibold rounded-lg hover:bg-brand-hoverDark transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={14} /> Beli Semua Set Ini
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════ KONSULTASI DESAIN ═══════════════ */}
        <section className="bg-brand-soft rounded-2xl p-8 lg:p-12 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-brand-accent font-semibold mb-2">KONSULTASI DESAIN</p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark mb-3">
                Butuh Bantuan Penataan Interior Profesional?
              </h2>
              <p className="text-sm text-brand-muted max-w-lg">
                Tim desainer interior Maison Lumina siap membantu Anda merencanakan tata letak, pencahayaan, dan pemilihan palet warna yang sempurna untuk hunian Anda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-brand-dark text-white text-sm font-semibold rounded-lg hover:bg-brand-hoverDark transition-colors flex items-center gap-2">
                <Phone size={14} /> Jadwalkan Konsultasi
              </button>
              <button className="px-6 py-3 bg-white text-brand-dark text-sm font-semibold rounded-lg border border-brand-border hover:bg-brand-bg transition-colors flex items-center gap-2">
                <Download size={14} /> Unduh Lookbook 2024
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
