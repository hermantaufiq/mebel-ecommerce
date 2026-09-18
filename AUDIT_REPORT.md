# Laporan Audit & Konsolidasi Logika Fundamental Sisi Pengguna (Maison Lumina)

**Proyek:** Maison Lumina — Atelier & Meubel Indonesia (SvelteKit 2 + Svelte 5 Runes + Tailwind CSS v4 + Prisma + Neon PostgreSQL)  
**Tanggal Audit:** 18 September 2026  
**Status Akhir:** ✅ **LULUS PENUH (ALL SPECIFICATIONS & HARDENING PASSED)**

---

## 1. Audit Alur Pengguna End-to-End

Berikut adalah hasil penelusuran alur pengguna secara end-to-end dari browsing awal hingga fitur "Beli Lagi" (Reorder):

| Langkah Alur | Komponen / File Logika | Validasi Server-Side? | Status | Catatan / Mekanisme |
| :--- | :--- | :---: | :---: | :--- |
| **1. Browsing (Beranda / Koleksi)** | `src/routes/+page.svelte`<br>`src/routes/produk/+page.svelte`<br>`src/lib/components/product/ProductCard.svelte` | ✅ Ya (data via SSR/DB) | ✅ Sesuai | Filter kategori, sorting harga/nama, search instan. Guest bebas browsing tanpa login. |
| **2. Lihat Detail Produk (PDP)** | `src/routes/produk/[slug]/+page.svelte` | ✅ Ya (data produk & varian real-time dari database) | ✅ Sesuai | Pilihan varian (`type: warna_kain, material_kayu, ukuran`), kalkulasi harga offset, indikator stok dinamis. |
| **3. Tambah ke Wishlist & Cart** | `src/lib/stores/wishlist.svelte.ts`<br>`src/lib/stores/cart.svelte.ts` | ✅ Ya (client store + sync server) | ✅ Sesuai | Wishlist murni guest/local tanpa login. Cart mengidentifikasi `productId + variantId`. Anti double-click feedback aktif. |
| **4. Buka Keranjang** | `src/routes/keranjang/+page.svelte`<br>`src/routes/keranjang/+page.server.ts`<br>`src/routes/api/cart/validate/+server.ts` | ✅ Ya (`/api/cart/validate` memverifikasi harga & stok database) | ✅ Sesuai | Bebas dibuka tanpa login. Begitu dibuka, sistem revalidasi stok riil atelier. Terdapat banner informatif ramah guest (Pola Shopee). |
| **5. Isi Form Pengiriman** | `src/routes/keranjang/+page.svelte` | ✅ Ya (divalidasi saat submit di `/api/checkout`) | ✅ Sesuai | Draft form disimpan ke `sessionStorage ('maison_pending_checkout')` jika guest dialihkan ke login, lalu di-restore otomatis saat kembali. |
| **6. Pilih Metode Pembayaran** | `src/routes/keranjang/+page.svelte` | ✅ Ya (divalidasi format & tipe di server) | ✅ Sesuai | Transfer Bank (BCA / Mandiri VA), Cicilan 0%, QRIS / E-Wallet Instan. |
| **7. Submit Order** | `src/routes/api/checkout/+server.ts` | ✅ Ya (Wajib login, revalidasi DB, atomic transaction) | ✅ Sesuai | Guest dicegat ramah ke `/login?redirect=/keranjang&from=checkout`. Unit price klien diabaikan; harga & stok ditarik dari DB dalam `prisma.$transaction`. |
| **8. Halaman Konfirmasi (E-Invoice)** | `src/routes/checkout/konfirmasi/+page.svelte`<br>`src/routes/checkout/konfirmasi/+page.server.ts` | ✅ Ya (`order.userId === session.user.id`) | ✅ Sesuai | Akses pihak ketiga ditolak dengan `403 Forbidden`. Menampilkan rincian pesanan resmi, instruksi transfer VA, dan nomor pesanan. |
| **9. Riwayat Pesanan (Akun)** | `src/routes/akun/+page.svelte`<br>`src/routes/akun/+page.server.ts`<br>`src/hooks.server.ts` | ✅ Ya (middleware `hooks.server.ts` + query `userId`) | ✅ Sesuai | Rute `/akun` dilindungi auth guard. Menampilkan pesanan, profil, poin loyalitas, dan buku alamat pengguna. |
| **10. Beli Lagi (Reorder)** | `src/routes/akun/+page.svelte`<br>`src/lib/stores/cart.svelte.ts` | ✅ Ya (validasi stok sebelum masuk cart) | ✅ Sesuai | Tersedia tombol "Beli Lagi" per produk dan "Beli Lagi Semua" per transaksi. Item langsung dimasukkan kembali ke cart dengan notifikasi toast. |

---

## 2. Checklist Aturan Fundamental

### 2.1 Identitas Item Cart
- [x] Item cart diidentifikasi dari kombinasi `productId + variantId`, bukan `productId` saja (`CartStore.hasItem`, `CartStore.addItem`).
- [x] Produk + varian identik yang ditambahkan dua kali → kuantitas bertambah (`existing.qty + newItem.qty`), tidak membuat baris baru.
- [x] Produk sama dengan varian berbeda (misal: warna Kain Emerald vs Beige) → baris terpisah dengan id unik.

### 2.2 Batas Quantity & Stok
- [x] Kuantitas minimum 1. Tombol "-" pada saat `qty === 1` memanggil `removeItem(id)` (menghapus item dengan aman).
- [x] Kuantitas tidak bisa melebihi stok maksimum varian (`Math.min(qty, maxStock)`).
- [x] Saat halaman `/keranjang` dibuka, stok divalidasi ulang via `/api/cart/validate` ke database Neon PostgreSQL (tidak percaya cache lokal mentah).

### 2.3 Satu Fungsi Kalkulasi Harga (Single Source of Truth)
- [x] `calculateCartTotals` di [`src/lib/cart-calculations.ts`](file:///c:/laragon/www/Ecommerce%20-%20Mebel/src/lib/cart-calculations.ts) menjadi satu-satunya acuan hitung subtotal, diskon, PPN 11%, dan total pembayaran.
- [x] Dipakai konsisten di: halaman Keranjang, API checkout transaksi server, halaman Konfirmasi, dan Riwayat Pesanan.
- [x] Unit test Vitest (`npx vitest run`) lulus 100% (10 tests passed across test suites).

### 2.4 Validasi Server-Side Saat Checkout
- [x] Endpoint `POST /api/checkout` mengambil ulang harga katalog (`product.price`) dan offset varian (`variant.priceOffset`) dari database — sama sekali **tidak** mempercayai `unitPrice` yang dikirim dari klien browser.
- [x] Proses pembuatan pesanan (`Order`), pengurangan stok varian (`decrement: item.qty`), dan pengosongan cart berjalan di dalam satu `prisma.$transaction` (ACID, atomic rollback jika stok tiba-tiba habis).
- [x] Manipulasi harga via console/devtools di client browser terbukti tidak berdampak apa pun ke nilai transaksi resmi di database.

### 2.5 Proteksi Kepemilikan Data
- [x] Halaman `/checkout/konfirmasi` memvalidasi `order.userId === session.user.id`. Percobaan membuka invoice pesanan milik orang lain langsung dihentikan dengan error `403 Forbidden`.
- [x] Halaman `/akun` memfilter query pesanan dan alamat dengan `where: { userId: user.id }`.
- [x] Middleware [`src/hooks.server.ts`](file:///c:/laragon/www/Ecommerce%20-%20Mebel/src/hooks.server.ts) secara global memproteksi seluruh rute privat (`/akun/*`).

### 2.6 Guest vs Logged-in State
- [x] Pengguna belum login: keranjang dan wishlist tersimpan mandiri di Svelte 5 reactive store dan `localStorage`.
- [x] Saat login atau registrasi akun baru: fungsi sinkronisasi `/api/auth/login` dan `/api/auth/register` otomatis menggabungkan (*merge*) item tamu ke tabel `CartItem` di database tanpa menduplikasi produk/varian yang sama.
- [x] Wishlist tetap dapat diakses dan digunakan penuh tanpa pernah dipaksa login.

### 2.7 Anti Race Condition
- [x] Tombol "Tambah ke Keranjang" di PDP dinonaktifkan (`disabled`) saat animasi konfirmasi berlangsung (`addedFeedback`) atau ketika stok habis (0).
- [x] Tombol "Buat Pesanan & Lanjutkan" di halaman checkout berstatus `disabled` dan menampilkan indikator loading spinner (`isSubmitting`) untuk mencegah *double-submit*.
- [x] Perubahan kuantitas di keranjang beroperasi secara instan di local store tanpa request HTTP bertumpuk.

### 2.8 Keamanan Otentikasi (Auth)
- [x] Verifikasi kata sandi diverifikasi murni dengan `bcrypt.compare` via `verifyPassword`.
- [x] Tidak ada lagi jalur pintas (*bypass*) atau login instan tanpa password. Akun demo `dian.sastro@example.com` di-hash dan diverifikasi dengan standar yang sama.
- [x] Cookie sesi (`ml_session`) menggunakan atribut keamanan ketat: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, dan `secure` pada mode produksi.

### 2.9 Guest Browsing & Login Wajib Saat Checkout (Pola Shopee)
- [x] Browsing katalog, pencarian, penyaringan, detail produk, wishlist, dan keranjang belanja dapat dilakukan tanpa login.
- [x] Rute `/keranjang` **terbuka untuk publik/guest**; pencegatan login hanya terjadi tepat saat menekan tombol submit pesanan.
- [x] Saat guest menekan tombol buat pesanan, draft data formulir pengiriman (nama, telepon, alamat, jadwal, catatan) disimpan di `sessionStorage ('maison_pending_checkout')`, lalu diarahkan ke `/login?redirect=/keranjang&from=checkout`.
- [x] Setelah login atau daftar akun, item keranjang digabung ke database, user dialihkan kembali ke `/keranjang`, dan data draft pengiriman langsung direstorasi otomatis.
- [x] Halaman `/login` menampilkan banner visual konteks pesanan jika dialihkan dari checkout.
- [x] Wishlist bebas dari keharusan login di setiap bagian.
- [x] `hooks.server.ts` tidak memblokir `/keranjang` untuk guest.

---

## 3. Evaluasi Kebutuhan Tambahan & Rekomendasi

1. **Error Handling & State Kosong**:
   - Status: Lengkap. Halaman keranjang kosong, wishlist kosong, dan riwayat pesanan kosong sudah memiliki ilustrasi dan tombol aksi (CTA) yang jelas menuju katalog furnitur.
2. **Notifikasi Transaksional**:
   - Status: Berjalan baik. Invoice instan diberikan via `/checkout/konfirmasi` lengkap dengan petunjuk transfer/QRIS, dan notifikasi konfirmasi interaktif saat reorder di `/akun`.
   - *Rekomendasi Tahap Admin*: Menambahkan modul email otomatis (Resend/SendGrid) saat status pesanan diubah oleh Admin (misal: "Pesanan Dikirim").
3. **Format & Konsistensi UI**:
   - Status: Konsisten. Seluruh representasi mata uang menggunakan utilitas `formatRupiah`, tanggal menggunakan `formatDateId`, dan warna status badge (Amber/Blue/Emerald) seragam di semua komponen.

---

## 4. Ringkasan Pengujian Sistem

- **TypeScript / Svelte Diagnostic (`npm run check`)**: 0 error, 0 warning.
- **Unit Testing Vitest (`npx vitest run`)**: 10 tests passed (100% success).
- **Vite Production Bundler (`vite build`)**: Seluruh bundle client, server chunks, dan routing halaman terkompilasi optimal (`✓ built in 1m 2s`).
- **Database Synchronization**: Tabel Neon PostgreSQL terhubung aktif dengan skema Prisma terbaru.

---

## 5. Kesimpulan & Kesiapan Pengembangan

Dengan seluruh checklist di Section 2 berstatus ✅ dan alur pengguna terverifikasi secara end-to-end tanpa regresi, **fondasi logika pengguna e-commerce Maison Lumina telah kokoh dan siap masuk ke pengembangan modul Admin Panel**.
