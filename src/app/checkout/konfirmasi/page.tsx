import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  CreditCard,
  Building,
  QrCode,
  MapPin,
  Calendar,
  Wrench,
  Download,
  Home,
  MessageCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";

interface KonfirmasiPageProps {
  searchParams: {
    order?: string;
    orderNumber?: string;
  };
}

const statusSteps = [
  { key: "Diterima", label: "Pesanan Diterima", desc: "Pesanan dan pembayaran diverifikasi butik." },
  { key: "Disiapkan", label: "Inspeksi & Penyiapan", desc: "Pengecekan kualitas kayu, kain, dan finishing." },
  { key: "Dikirim", label: "Pengiriman Khusus Armada", desc: "Dalam perjalanan dengan armada ber-AC Maison Lumina." },
  { key: "Selesai", label: "Tiba & Perakitan", desc: "Perakitan white-glove di tempat dan serah terima." },
];

export default async function KonfirmasiPage({ searchParams }: KonfirmasiPageProps) {
  const orderNumber = searchParams.order || searchParams.orderNumber;
  const session = await auth();
  const sessionUserId = session?.user?.id;

  if (!orderNumber) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="font-serif text-2xl font-bold text-dark mb-2">
          Nomor Pesanan Tidak Ditemukan
        </h1>
        <p className="text-text-secondary text-sm max-w-md mb-6">
          Tautan konfirmasi tidak menyertakan nomor pesanan yang valid.
        </p>
        <Link href="/">
          <Button className="bg-dark text-white text-xs uppercase tracking-wider px-6 py-2.5">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch full Order details with items and relations directly from database
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Strict ownership verification: order must exist AND belong to current session user
  if (!order || order.userId !== sessionUserId) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF9F6]">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle size={28} />
        </div>
        <span className="text-[11px] font-semibold tracking-widest text-red-600 uppercase mb-1">
          AKSES DITOLAK (403 FORBIDDEN)
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark mb-2">
          Tidak Dapat Mengakses Pesanan
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm max-w-md mb-6">
          Anda tidak memiliki izin untuk melihat rincian pesanan <strong>{orderNumber}</strong>. Pastikan Anda telah masuk menggunakan akun yang sesuai.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/login?redirect=/checkout/konfirmasi?order=${orderNumber}`}>
            <Button className="bg-dark text-white text-xs uppercase tracking-wider px-6 py-2.5">
              Masuk ke Akun Anda
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="text-xs uppercase tracking-wider px-6 py-2.5">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current step index
  const currentStepIndex = Math.max(
    0,
    statusSteps.findIndex((s) => s.key === order.status)
  );

  const formattedOrderDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(order.createdAt));

  const formattedDeliveryDate = order.deliveryDate
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(order.deliveryDate))
    : "Sesuai konfirmasi concierge";

  const waMessage = encodeURIComponent(
    `Halo Concierge Maison Lumina, saya ingin konfirmasi pesanan dengan nomor order: ${order.orderNumber}.`
  );

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-16">
      {/* ═══════════════ 1. HERO SUKSES ═══════════════ */}
      <section className="bg-dark text-white py-12 sm:py-16 border-b border-border-soft/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              {/* Payment / Order Badge */}
              <div className="flex items-center gap-2 mb-3">
                {order.paymentStatus === "Lunas" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                    <CheckCircle2 size={14} />
                    Pembayaran Berhasil
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                    <Clock size={14} />
                    Menunggu Pembayaran
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                Terima Kasih, Pesanan Anda Diterima
              </h1>

              <p className="text-white/70 text-xs sm:text-sm max-w-2xl">
                Nomor Pesanan:{" "}
                <strong className="text-white font-mono tracking-wider text-base">
                  {order.orderNumber}
                </strong>{" "}
                • Dibuat pada {formattedOrderDate}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-lg flex items-center gap-2"
                >
                  <Home size={14} />
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MAIN CONTENT GRID ═══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ═══════════════ 2. KOLOM KIRI (STATUS, PENGIRIMAN, PEMBAYARAN) ═══════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Timeline Stepper Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border-soft shadow-sm">
              <h2 className="font-serif text-lg font-bold text-dark mb-6 flex items-center gap-2">
                <Package size={20} className="text-accent" />
                <span>Status Perkembangan Pesanan</span>
              </h2>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-soft">
                {statusSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="relative group">
                      {/* Dot icon indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-xs"
                            : isCurrent
                            ? "bg-dark text-white ring-4 ring-dark/10"
                            : "bg-white border-2 border-border-soft text-text-secondary"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm font-bold ${
                              isCurrent ? "text-dark" : isDone ? "text-text-primary" : "text-text-secondary"
                            }`}
                          >
                            {step.label}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-dark text-white">
                              Tahap Saat Ini
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card: Pengiriman Khusus Armada */}
            <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-dark pb-2 border-b border-border-soft flex items-center gap-2">
                <Truck size={18} className="text-accent" />
                <span>Pengiriman Khusus Armada Maison Lumina</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-text-secondary block mb-1">
                    Penerima &amp; Kontak:
                  </span>
                  <p className="font-bold text-dark">{order.recipientName}</p>
                  <p className="text-text-secondary mt-0.5">{order.recipientPhone}</p>
                </div>

                <div>
                  <span className="text-[11px] text-text-secondary block mb-1">
                    Jadwal Kedatangan Armada:
                  </span>
                  <p className="font-bold text-dark">{formattedDeliveryDate}</p>
                  <p className="text-accent font-medium mt-0.5">
                    {order.deliverySlot || "Slot Waktu Standar Butik"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border-soft text-xs">
                <span className="text-[11px] text-text-secondary block mb-1">
                  Alamat Lengkap Tujuan:
                </span>
                <p className="text-dark font-medium leading-relaxed">
                  {order.shippingAddress}
                </p>
                {order.deliveryNote && (
                  <p className="mt-2 p-2.5 bg-brand-soft rounded-lg text-text-secondary italic text-[11px]">
                    Catatan kurir: "{order.deliveryNote}"
                  </p>
                )}
              </div>

              {order.installService && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                  <Wrench size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Termasuk Jasa Perakitan di Tempat (Gratis)</strong> — Tim spesialis perakit butik kami akan menyetel dan membersihkan area perakitan.
                  </span>
                </div>
              )}
            </div>

            {/* Card: Status Pembayaran */}
            <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-dark pb-2 border-b border-border-soft flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard size={18} className="text-accent" />
                  Status Pembayaran
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.paymentStatus === "Lunas"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Metode Dipilih:</span>
                  <span className="font-bold text-dark">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Waktu Transaksi:</span>
                  <span className="font-medium text-dark">{formattedOrderDate}</span>
                </div>

                {order.paymentStatus === "Pending" && (
                  <div className="p-4 bg-brand-soft border border-border-soft rounded-xl space-y-2 mt-3">
                    <p className="font-semibold text-dark text-xs">
                      Instruksi Pembayaran:
                    </p>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Silakan selesaikan pembayaran ke rekening Virtual Account resmi Maison Lumina sebelum kurir diberangkatkan. Konfirmasi pembayaran otomatis diproses dalam 5-10 menit.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════ 3. KOLOM KANAN (RINGKASAN ITEM, RINCIAN, WA CONCIERGE) ═══════════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Items Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-dark pb-2 border-b border-border-soft flex items-center justify-between">
                <span>Rincian Item Pesanan</span>
                <span className="text-xs font-sans text-text-secondary font-medium">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} Produk
                </span>
              </h2>

              <div className="divide-y divide-border-soft">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5 items-center">
                    <div className="w-16 h-16 bg-[#F5F2EB] rounded-xl overflow-hidden shrink-0 border border-border-soft/60">
                      <img
                        src={item.product?.images?.[0]?.url || "/placeholder.png"}
                        alt={item.product?.name || "Produk Furnitur"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-bold text-dark truncate">
                        {item.product?.name || "Furnitur Maison Lumina"}
                      </h4>
                      {item.variantLabel && (
                        <p className="text-[11px] text-accent font-medium mt-0.5">
                          {item.variantLabel}
                        </p>
                      )}
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        {item.qty} × {formatRupiah(item.priceAtOrder)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-dark">
                      {formatRupiah(item.priceAtOrder * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Summary Breakdown */}
              <div className="pt-4 border-t border-border-soft space-y-2 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal Item</span>
                  <span className="font-semibold text-dark">
                    {formatRupiah(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span>Ongkos Kirim Khusus Armada</span>
                  <span className="font-semibold text-emerald-600 uppercase text-[11px]">
                    {order.shippingFee > 0 ? formatRupiah(order.shippingFee) : "GRATIS"}
                  </span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span>Jasa Perakitan White-Glove</span>
                  <span className="font-semibold text-emerald-600 uppercase text-[11px]">
                    {order.installFee > 0 ? formatRupiah(order.installFee) : "GRATIS"}
                  </span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span>Pajak Pertambahan Nilai (PPN 11%)</span>
                  <span className="font-semibold text-dark">
                    {formatRupiah(order.tax)}
                  </span>
                </div>

                <div className="pt-3 border-t border-border-soft flex items-baseline justify-between">
                  <span className="font-serif text-sm font-bold text-dark">
                    Total Pembayaran
                  </span>
                  <span className="font-serif text-lg font-bold text-dark">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Concierge Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-accent/30 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-accent font-serif font-bold text-base">
                <MessageCircle size={20} />
                <span>Concierge Pribadi Anda</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Butuh perubahan jadwal kedatangan armada kurir atau permintaan penataan khusus interior ruangan? Tim concierge kami siap mendampingi Anda.
              </p>
              <a
                href={`https://wa.me/6281234567890?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-sm"
              >
                <MessageCircle size={15} />
                <span>Hubungi Concierge via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
