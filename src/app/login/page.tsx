'use client';

// TODO(Tahap 5): Ganti sistem auth manual ini dengan NextAuth.js/Lucia yang proper.
// Jangan biarkan dua sistem auth berjalan bersamaan saat migrasi nanti.

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { login, register, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'masuk' | 'daftar'>('masuk');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let res;
    if (activeTab === 'masuk') {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    if (res.success) {
      router.push(redirectUrl || '/akun');
    } else {
      setErrorMsg(res.error || 'Email atau kata sandi salah');
    }
  };

  const handleFillDemo = () => {
    setActiveTab('masuk');
    setEmail('dian.sastro@example.com');
    setPassword('demo1234');
    setErrorMsg(null);
  };

  return (
    <div className="page-fade-in relative min-h-[85vh]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=60"
          alt="Interior Japandi"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-bg/70 backdrop-blur-md" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated p-8 border border-brand-border">
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-xs tracking-[0.2em] uppercase text-brand-accent font-semibold mb-1">
              MAISON LUMINA ATELIER
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
              {activeTab === 'masuk' ? 'Selamat Datang' : 'Buat Akun Baru'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1.5">
              {redirectUrl === '/keranjang'
                ? 'Silakan masuk untuk melanjutkan proses pemesanan furniture kurasi Anda.'
                : 'Akses riwayat pesanan, status pengiriman armada, dan wishlist eksklusif.'}
            </p>
          </div>

          {/* Notice Banner if redirected from checkout */}
          {redirectUrl && (
            <div className="mb-5 p-3.5 bg-brand-soft border border-brand-accent/30 rounded-xl flex items-start gap-2.5 text-xs text-brand-dark">
              <ShoppingBag size={16} className="text-brand-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Checkout Membutuhkan Akun</span>
                Silakan masuk atau daftar terlebih dahulu untuk melanjutkan pesanan Anda ke tahap konfirmasi.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex mb-6 bg-brand-bg rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('masuk');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'masuk'
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-dark'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('daftar');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'daftar'
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'text-brand-muted hover:text-brand-dark'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'daftar' && (
              <div>
                <label className="text-xs font-medium text-brand-dark mb-1 block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dian Sastrowardoyo"
                  className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg bg-white focus:outline-none focus:border-brand-accent"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-brand-dark mb-1 block">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg bg-white focus:outline-none focus:border-brand-accent"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-brand-dark">Kata Sandi</label>
                {activeTab === 'masuk' && (
                  <span className="text-[11px] text-brand-muted">
                    Min. 6 karakter
                  </span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg bg-white focus:outline-none focus:border-brand-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-brand-hoverDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading
                ? 'Memproses...'
                : activeTab === 'masuk'
                ? 'MASUK KE AKUN'
                : 'DAFTAR AKUN BARU'}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-5 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 bg-brand-soft/60 hover:bg-brand-soft text-brand-dark rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-brand-border/60"
            >
              <Sparkles size={13} className="text-brand-accent" />
              <span>Gunakan Akun Demo: <strong>dian.sastro@example.com</strong></span>
            </button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-brand-muted">
            <Lock size={12} />
            <span>Enkripsi Aman &amp; Privasi Terjaga</span>
          </div>
        </div>
      </div>
    </div>
  );
}
