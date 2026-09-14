"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Truck,
  Wrench,
  ShieldCheck,
  Building,
  CreditCard,
  QrCode,
  CalendarDays,
  Clock,
  Sparkles,
  Home,
  AlertCircle,
  AlertTriangle,
  Lock,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { calculateCartTotals } from "@/lib/cart-calculations";
import { formatRupiah } from "@/lib/utils";
import { createOrder, getUserAddressesAction } from "@/lib/actions/order";

// Validation schema using Zod
const shippingSchema = z.object({
  recipientName: z
    .string()
    .min(3, "Nama penerima wajib diisi minimal 3 karakter"),
  recipientPhone: z
    .string()
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Nomor telepon / WhatsApp tidak valid (contoh: 081234567890)"
    ),
  shippingAddress: z
    .string()
    .min(10, "Alamat lengkap wajib diisi minimal 10 karakter"),
  deliveryNotes: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export default function KeranjangPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  // Cart store
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    installService,
    toggleInstallService,
    validateCartStock,
    deliveryDate,
    setDeliveryDate,
    deliverySlot,
    setDeliverySlot,
  } = useCartStore();

  // NextAuth Session
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user;

  // Component state
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("Transfer BCA/Mandiri");
  const [stockWarnings, setStockWarnings] = React.useState<string[]>([]);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Calculate minimum delivery date (H+2)
  const minDeliveryDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    mode: "onChange",
    defaultValues: {
      recipientName: "",
      recipientPhone: "",
      shippingAddress: "",
      deliveryNotes: "",
    },
  });

  // Client hydration check & stock validation
  React.useEffect(() => {
    setMounted(true);

    if (items.length > 0) {
      validateCartStock().then((result) => {
        if (result.adjusted) {
          setStockWarnings(result.messages);
        }
      });
    }

    // Initialize delivery date to H+2 if empty
    if (!deliveryDate) {
      setDeliveryDate(minDeliveryDate);
    }
    if (!deliverySlot) {
      setDeliverySlot("Pagi (09:00 - 12:00 WIB)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch saved addresses and auto-fill if user logged in
  React.useEffect(() => {
    if (isLoggedIn && user?.id) {
      getUserAddressesAction(user.id).then((addresses) => {
        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setValue("recipientName", defaultAddr.recipient, { shouldValidate: true });
            setValue("recipientPhone", defaultAddr.phone, { shouldValidate: true });
            setValue("shippingAddress", defaultAddr.fullAddress, { shouldValidate: true });
            if (defaultAddr.notes) {
              setValue("deliveryNotes", defaultAddr.notes);
            }
          }
        } else if (user.name) {
          // Pre-fill user's name if no saved address
          setValue("recipientName", user.name, { shouldValidate: true });
        }
      });
    }
  }, [isLoggedIn, user, setValue]);

  // Auth Guard: if items exist but user is not logged in, redirect to login
  React.useEffect(() => {
    if (mounted && items.length > 0 && !isLoggedIn) {
      router.push("/login?redirect=/keranjang");
    }
  }, [mounted, items.length, isLoggedIn, router]);

  // Handle saved address selection
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const addr = savedAddresses.find((a) => a.id === addressId);
    if (addr) {
      setValue("recipientName", addr.recipient, { shouldValidate: true });
      setValue("recipientPhone", addr.phone, { shouldValidate: true });
      setValue("shippingAddress", addr.fullAddress, { shouldValidate: true });
      setValue("deliveryNotes", addr.notes || "");
    }
  };

  // Cart totals calculated via single source of truth
  const totals = calculateCartTotals(items, {
    shippingFee: 0, // Free White-Glove delivery
    installFee: 0,  // Free installation
    applyTax: true, // 11% PPN included
  });

  // Handle order creation submit
  const onSubmit = async (data: ShippingFormValues) => {
    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createOrder({
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        shippingAddress: data.shippingAddress,
        deliveryNote: data.deliveryNotes,
        deliveryDate,
        deliverySlot,
        installService,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
        })),
      });

      if (res.success && res.orderNumber) {
        clearCart();
        router.push(`/checkout/konfirmasi?order=${res.orderNumber}`);
      } else {
        setSubmitError(
          res.error || "Gagal membuat pesanan. Silakan periksa kembali keranjang Anda."
        );
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Submit checkout error:", err);
      setSubmitError("Terjadi gangguan koneksi. Silakan coba kembali.");
      setIsSubmitting(false);
    }
  };

  // Initial loading state
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dark" />
        <p className="mt-4 text-xs text-text-secondary">Memuat keranjang Anda...</p>
      </div>
    );
  }

  // Guard: Empty cart state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-brand-soft rounded-full flex items-center justify-center text-brand-muted">
          <Home size={32} />
        </div>
        <h1 className="font-serif text-3xl font-bold text-dark mb-3">
          Keranjang Anda Masih Kosong
        </h1>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-8">
          Jelajahi koleksi furnitur Japandi &amp; Skandinavia kurasi Maison Lumina untuk melengkapi keindahan hunian Anda.
        </p>
        <Link href="/koleksi">
          <Button className="bg-dark hover:bg-dark/90 text-white px-8 py-3 text-sm font-semibold rounded-lg shadow-sm">
            Jelajahi Koleksi Furnitur
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
          <Link href="/" className="hover:text-accent transition-colors">
            BERANDA
          </Link>
          <ChevronRight size={12} />
          <span className="text-dark font-semibold">KERANJANG &amp; CHECKOUT</span>
        </nav>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-dark mb-2">
            Pemesanan &amp; Pengiriman Khusus
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Konfirmasi item furnitur pilihan Anda, atur jadwal kurir khusus armada, dan lengkapi detail pengiriman.
          </p>
        </div>

        {/* Stock Warnings Banner if stock was adjusted */}
        {stockWarnings.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Penyesuaian Kuantitas Stok:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {stockWarnings.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Submission Error Banner */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Gagal Memproses Pesanan:</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ═══════════════ LEFT COLUMN: ITEMS & FURNITURE SERVICES ═══════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Item List Card */}
            <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm">
              <h2 className="font-serif text-lg font-bold text-dark mb-4 pb-3 border-b border-border-soft flex items-center justify-between">
                <span>Furnitur Terpilih</span>
                <span className="text-xs font-sans font-medium text-text-secondary">
                  {items.reduce((s, i) => s + i.qty, 0)} Unit
                </span>
              </h2>

              <div className="divide-y divide-border-soft">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F5F2EB] rounded-xl overflow-hidden shrink-0 border border-border-soft/60">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-dark truncate">
                          {item.name}
                        </h3>
                        {item.variantLabel && (
                          <p className="text-xs text-accent font-medium mt-0.5">
                            Varian: {item.variantLabel}
                          </p>
                        )}
                        {item.material && (
                          <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                            {item.material}
                          </p>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-3 pt-2">
                        <span className="text-sm font-bold text-dark">
                          {formatRupiah(item.unitPrice)}
                        </span>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border-soft rounded-lg bg-[#FAF9F6] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.qty === 1) {
                                  removeItem(item.id);
                                } else {
                                  updateQty(item.id, item.qty - 1);
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-dark hover:bg-border-soft/30 transition-colors"
                              aria-label="Kurangi kuantitas"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-dark">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-dark hover:bg-border-soft/30 transition-colors"
                              aria-label="Tambah kuantitas"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-text-secondary hover:text-red-600 transition-colors rounded-md"
                            title="Hapus item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Furniture Special Services Card */}
            <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-dark pb-2 border-b border-border-soft flex items-center gap-2">
                <Wrench size={18} className="text-accent" />
                <span>Layanan Khusus Furniture</span>
              </h2>

              {/* Assembly Service Checkbox */}
              <label className="flex items-start gap-3.5 p-4 rounded-xl border border-accent/20 bg-accent/5 cursor-pointer hover:bg-accent/10 transition-colors">
                <input
                  type="checkbox"
                  checked={installService}
                  onChange={toggleInstallService}
                  className="mt-1 h-4 w-4 rounded border-border-soft text-dark focus:ring-dark"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-dark">
                    <span>Jasa Perakitan di Tempat (White-Glove Service)</span>
                    <span className="text-accent uppercase tracking-wider text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-accent/20">
                      GRATIS
                    </span>
                  </div>
                  <p className="text-text-secondary mt-1">
                    Tim ahli Maison Lumina akan merakit furnitur langsung di ruangan Anda, memastikan stabilitas, dan merapikan seluruh sisa material kemasan.
                  </p>
                </div>
              </label>

              {/* Delivery Schedule (Date & Slot) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Date Picker */}
                <div>
                  <label className="text-xs font-semibold text-dark mb-1.5 flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-accent" />
                    <span>Tanggal Pengiriman Khusus</span>
                  </label>
                  <input
                    type="date"
                    min={minDeliveryDate}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-border-soft rounded-lg focus:outline-none focus:border-dark font-medium"
                  />
                  <p className="text-[10px] text-text-secondary mt-1">
                    Minimal H+2 untuk persiapan inspeksi butik.
                  </p>
                </div>

                {/* Courier Time Slot */}
                <div>
                  <label className="text-xs font-semibold text-dark mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} className="text-accent" />
                    <span>Slot Waktu Kurir Armada</span>
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-border-soft rounded-lg focus:outline-none focus:border-dark font-medium"
                  >
                    <option value="Pagi (09:00 - 12:00 WIB)">Pagi (09:00 - 12:00 WIB)</option>
                    <option value="Siang (13:00 - 16:00 WIB)">Siang (13:00 - 16:00 WIB)</option>
                    <option value="Sore (16:00 - 19:00 WIB)">Sore (16:00 - 19:00 WIB)</option>
                  </select>
                  <p className="text-[10px] text-text-secondary mt-1">
                    Kurir akan menghubungi WhatsApp 1 jam sebelum tiba.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════ RIGHT COLUMN: FORM & SUMMARY (STICKY) ═══════════════ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Shipping Information Form */}
              <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-dark pb-2 border-b border-border-soft flex items-center justify-between">
                  <span>Informasi Pengiriman</span>
                  {savedAddresses.length > 0 && (
                    <span className="text-[11px] text-accent font-sans font-medium">
                      {savedAddresses.length} Alamat Tersimpan
                    </span>
                  )}
                </h2>

                {/* Saved Address Selector if available */}
                {savedAddresses.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">
                      Gunakan Alamat Tersimpan:
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handleSelectAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-border-soft rounded-lg focus:outline-none focus:border-dark font-medium"
                    >
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.recipient} — {addr.fullAddress.slice(0, 35)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Recipient Name */}
                <div>
                  <label className="text-xs font-medium text-dark mb-1 block">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    {...register("recipientName")}
                    placeholder="Nama lengkap penerima"
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border rounded-lg focus:outline-none ${
                      errors.recipientName
                        ? "border-red-400 focus:border-red-500"
                        : "border-border-soft focus:border-dark"
                    }`}
                  />
                  {errors.recipientName && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.recipientName.message}
                    </p>
                  )}
                </div>

                {/* Recipient Phone */}
                <div>
                  <label className="text-xs font-medium text-dark mb-1 block">
                    No. Telepon / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    {...register("recipientPhone")}
                    placeholder="Contoh: 081234567890"
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border rounded-lg focus:outline-none ${
                      errors.recipientPhone
                        ? "border-red-400 focus:border-red-500"
                        : "border-border-soft focus:border-dark"
                    }`}
                  />
                  {errors.recipientPhone && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.recipientPhone.message}
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div>
                  <label className="text-xs font-medium text-dark mb-1 block">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <textarea
                    rows={3}
                    {...register("shippingAddress")}
                    placeholder="Nama jalan, nomor rumah/ruko, RT/RW, kelurahan, kecamatan, kota, dan kode pos"
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border rounded-lg focus:outline-none resize-none ${
                      errors.shippingAddress
                        ? "border-red-400 focus:border-red-500"
                        : "border-border-soft focus:border-dark"
                    }`}
                  />
                  {errors.shippingAddress && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.shippingAddress.message}
                    </p>
                  )}
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="text-xs font-medium text-dark mb-1 block">
                    Catatan untuk Kurir &amp; Tim Perakit (Opsional)
                  </label>
                  <input
                    type="text"
                    {...register("deliveryNotes")}
                    placeholder="Contoh: Titip satpam komplek, atau lantai 2 tanpa lift"
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] border border-border-soft rounded-lg focus:outline-none focus:border-dark"
                  />
                </div>
              </div>

              {/* Payment Summary & Method Card */}
              <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm space-y-5">
                <h2 className="font-serif text-lg font-bold text-dark pb-2 border-b border-border-soft">
                  Metode Pembayaran
                </h2>

                {/* Payment Method Radio Group */}
                <div className="space-y-2.5">
                  {[
                    {
                      id: "Transfer BCA/Mandiri",
                      title: "Transfer Bank (BCA / Mandiri)",
                      desc: "Virtual Account otomatis dengan verifikasi instan",
                      icon: <Building size={16} className="text-accent" />,
                    },
                    {
                      id: "Cicilan 0% (12x)",
                      title: "Cicilan 0% hingga 12 Bulan",
                      desc: "Kartu Kredit BCA, Mandiri, CIMB & BNI",
                      icon: <CreditCard size={16} className="text-accent" />,
                    },
                    {
                      id: "QRIS/E-Wallet",
                      title: "QRIS / GoPay / ShopeePay",
                      desc: "Scan langsung dari seluruh aplikasi m-banking & e-wallet",
                      icon: <QrCode size={16} className="text-accent" />,
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-dark bg-dark/5 shadow-xs"
                          : "border-border-soft hover:bg-brand-soft/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 h-3.5 w-3.5 text-dark focus:ring-dark border-border-soft"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-dark">
                          {method.icon}
                          <span>{method.title}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {method.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="pt-4 border-t border-border-soft space-y-2.5 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-dark">
                      {formatRupiah(totals.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-text-secondary">
                    <span>Pengiriman Armada Khusus</span>
                    <span className="font-semibold text-emerald-600 uppercase tracking-wider text-[11px]">
                      GRATIS (JABODETABEK)
                    </span>
                  </div>

                  <div className="flex justify-between text-text-secondary">
                    <span>Jasa Perakitan White-Glove</span>
                    <span className="font-semibold text-emerald-600 uppercase tracking-wider text-[11px]">
                      GRATIS
                    </span>
                  </div>

                  <div className="flex justify-between text-text-secondary">
                    <span>Pajak Pertambahan Nilai (PPN 11%)</span>
                    <span className="font-semibold text-dark">
                      {formatRupiah(totals.tax)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border-soft flex items-baseline justify-between">
                    <div>
                      <span className="font-serif text-sm font-bold text-dark block">
                        Total Pembayaran
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        Sudah termasuk PPN &amp; seluruh layanan instalasi
                      </span>
                    </div>
                    <span className="font-serif text-lg font-bold text-dark">
                      {formatRupiah(totals.total)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isValid || !paymentMethod || isSubmitting}
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-dark hover:bg-dark/90 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <span>Lanjutkan Pembayaran / Buat Pesanan</span>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-border-soft grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Garansi Pengiriman Aman</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Headphones size={14} className="text-accent shrink-0" />
                    <span>Layanan Pelanggan 24/7</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
