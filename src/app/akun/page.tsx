'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, ShoppingBag, User, MapPin, Heart, MessageCircle, ChevronRight, Truck, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react';
import { mockUserProfile, mockOrders } from '@/lib/mockData';
import { formatRupiah, formatDateId } from '@/lib/utils';

const sidebarNav = [
  { key: 'riwayat', label: 'Riwayat Pesanan', icon: ShoppingBag, badge: 3 },
  { key: 'profil', label: 'Profil Pengguna', icon: User },
  { key: 'alamat', label: 'Alamat Pengiriman', icon: MapPin },
  { key: 'wishlist', label: 'Wishlist Tersimpan', icon: Heart },
];

export default function AkunPage() {
  const [activeSection, setActiveSection] = useState('riwayat');
  const [activeOrderFilter, setActiveOrderFilter] = useState('Semua');
  const user = mockUserProfile;

  const filteredOrders = activeOrderFilter === 'Semua'
    ? mockOrders
    : mockOrders.filter((o) => {
        if (activeOrderFilter === 'Dikirim') return o.status === 'Sedang Dikirim';
        if (activeOrderFilter === 'Selesai') return o.status === 'Selesai';
        return true;
      });

  return (
    <div className="page-fade-in">
      {/* ═══════════════ PROFILE BANNER ═══════════════ */}
      <section className="bg-brand-soft border-b border-brand-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-border border-2 border-white shadow-soft">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs tracking-[0.15em] uppercase text-brand-accent font-semibold">AKUN MEMBER</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-dark text-white rounded-full">{user.tier} Tier</span>
                </div>
                <h1 className="font-serif text-xl font-bold text-brand-dark">{user.name}</h1>
                <p className="text-xs text-brand-muted">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-brand-muted">Total Poin Loyalitas</p>
                <p className="font-serif text-2xl font-bold text-brand-dark">{user.loyaltyPoints.toLocaleString()} Pts</p>
              </div>
              <button className="px-4 py-2.5 bg-brand-dark text-white text-xs font-semibold rounded-lg hover:bg-brand-hoverDark transition-colors flex items-center gap-1.5">
                <Gift size={14} /> Klaim Reward
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 flex-shrink-0 space-y-3">
            {sidebarNav.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.key
                    ? 'bg-brand-dark text-white'
                    : 'text-brand-muted hover:bg-brand-bg hover:text-brand-dark'
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    activeSection === item.key ? 'bg-brand-accent text-white' : 'bg-brand-border text-brand-muted'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Help card */}
            <div className="bg-brand-soft rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={16} className="text-brand-accent" />
                <h4 className="font-semibold text-xs text-brand-dark">Butuh Bantuan?</h4>
              </div>
              <p className="text-[11px] text-brand-muted mb-3">
                Concierge interior design & customer care kami siap melayani Anda setiap hari.
              </p>
              <button className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1">
                Hubungi via WhatsApp <ChevronRight size={12} />
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {activeSection === 'riwayat' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-brand-dark mb-1">Riwayat Pesanan</h2>
                    <p className="text-sm text-brand-muted">Lacak pengiriman dan tinjau riwayat pembelian furnitur Anda.</p>
                  </div>
                  <div className="flex gap-2">
                    {['Semua', 'Dikirim', 'Selesai'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveOrderFilter(f)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          activeOrderFilter === f
                            ? 'bg-brand-dark text-white'
                            : 'bg-white text-brand-muted border border-brand-border hover:border-brand-dark'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const statusBadge = order.status === 'Sedang Dikirim'
                      ? 'bg-blue-50 text-blue-700'
                      : order.status === 'Selesai'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700';

                    return (
                      <div key={order.id} className="bg-white rounded-xl border border-brand-border p-5">
                        {/* Order header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`${statusBadge} px-2.5 py-1 text-[11px] font-semibold rounded-full flex items-center gap-1`}>
                              {order.status === 'Selesai' ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                              {order.status === 'Sedang Dikirim' ? 'Sedang Dikirim' : order.status}
                            </span>
                            <div>
                              <p className="text-xs text-brand-muted">No. Pesanan: <span className="text-brand-dark font-medium">{order.orderNumber}</span></p>
                              <p className="text-xs text-brand-dark font-semibold">
                                {order.status === 'Sedang Dikirim'
                                  ? `Estimasi Tiba: ${order.shippingDate ? formatDateId(order.shippingDate) : '-'}`
                                  : `Diterima: ${order.shippingDate ? formatDateId(order.shippingDate) : '-'}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-brand-muted">Total Pembayaran</p>
                            <p className="font-bold text-brand-dark">{formatRupiah(order.total)}</p>
                          </div>
                        </div>

                        {/* Order items */}
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 py-3 border-t border-brand-border">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-brand-soft flex-shrink-0">
                              <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-brand-dark">{item.product.name}</h4>
                              <p className="text-xs text-brand-muted">{item.variantLabel} • {item.qty} Unit</p>
                              {order.status === 'Sedang Dikirim' && (
                                <p className="text-[11px] text-brand-accent font-semibold mt-0.5">Kurir: Maison White-Glove Logistics</p>
                              )}
                              {order.status === 'Selesai' && (
                                <p className="text-[11px] text-green-600 font-semibold mt-0.5">
                                  {order.total > 10000000 ? 'Pemasangan Gratis Selesai' : 'Garansi 1 Tahun Aktif'}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href="/checkout/konfirmasi"
                                className="px-3 py-1.5 text-xs font-medium border border-brand-border rounded-lg text-brand-dark hover:bg-brand-bg transition-colors"
                              >
                                Detail Pesanan
                              </Link>
                              {order.status === 'Sedang Dikirim' ? (
                                <button className="px-3 py-1.5 text-xs font-semibold bg-brand-dark text-white rounded-lg hover:bg-brand-hoverDark transition-colors">
                                  Lacak Kurir
                                </button>
                              ) : (
                                <button className="px-3 py-1.5 text-xs font-semibold bg-brand-dark text-white rounded-lg hover:bg-brand-hoverDark transition-colors flex items-center gap-1">
                                  <RotateCcw size={12} /> Beli Lagi
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === 'profil' && (
              <div className="bg-white rounded-xl border border-brand-border p-6">
                <h2 className="font-serif text-xl font-bold text-brand-dark mb-6">Profil Pengguna</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs text-brand-muted mb-1 block">Nama Lengkap</label>
                    <input type="text" defaultValue={user.name} className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg focus:outline-none focus:border-brand-accent" />
                  </div>
                  <div>
                    <label className="text-xs text-brand-muted mb-1 block">Email</label>
                    <input type="email" defaultValue={user.email} className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg focus:outline-none focus:border-brand-accent" />
                  </div>
                  <div>
                    <label className="text-xs text-brand-muted mb-1 block">No. Telepon</label>
                    <input type="text" defaultValue="+62 812-3456-7890" className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg focus:outline-none focus:border-brand-accent" />
                  </div>
                  <button className="px-5 py-2.5 bg-brand-dark text-white text-sm font-semibold rounded-lg hover:bg-brand-hoverDark transition-colors">
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'alamat' && (
              <div className="bg-white rounded-xl border border-brand-border p-6">
                <h2 className="font-serif text-xl font-bold text-brand-dark mb-6">Alamat Pengiriman</h2>
                {user.addresses.map((addr) => (
                  <div key={addr.id} className="p-4 border border-brand-border rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-brand-accent" />
                      <span className="text-sm font-semibold text-brand-dark">{addr.recipient}</span>
                      {addr.isDefault && <span className="text-[10px] bg-brand-accent text-white px-2 py-0.5 rounded-full font-semibold">Utama</span>}
                    </div>
                    <p className="text-xs text-brand-muted">{addr.phone}</p>
                    <p className="text-xs text-brand-muted">{addr.fullAddress}</p>
                    {addr.notes && <p className="text-xs text-brand-muted italic mt-1">Catatan: {addr.notes}</p>}
                  </div>
                ))}
                <button className="px-4 py-2 text-sm font-semibold border border-brand-border rounded-lg text-brand-dark hover:bg-brand-bg transition-colors">
                  + Tambah Alamat Baru
                </button>
              </div>
            )}

            {activeSection === 'wishlist' && (
              <div className="bg-white rounded-xl border border-brand-border p-6 text-center">
                <Heart size={40} className="mx-auto text-brand-border mb-4" />
                <h3 className="font-serif text-lg font-bold text-brand-dark mb-2">Lihat Wishlist Anda</h3>
                <p className="text-sm text-brand-muted mb-4">Kelola produk favorit yang tersimpan di wishlist Anda.</p>
                <Link href="/wishlist" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white text-sm font-semibold rounded-lg hover:bg-brand-hoverDark transition-colors">
                  Buka Wishlist <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
