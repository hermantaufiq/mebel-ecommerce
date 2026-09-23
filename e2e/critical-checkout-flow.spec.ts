import { test, expect } from '@playwright/test';

test.describe('Alur Kritis End-to-End: Guest Browse -> Add to Cart -> Login in-between -> Checkout Order', () => {
	test('harus berhasil melakukan alur checkout lengkap dengan migrasi guest cart saat login', async ({ page }) => {
		// 1. Buka Beranda sebagai guest
		await page.goto('/');
		await expect(page).toHaveTitle(/Maison Lumina/);

		// 2. Navigasi ke halaman produk
		await page.goto('/produk');
		await expect(page.locator('h1')).toContainText(/Katalog|Koleksi/);

		// 3. Buka halaman detail salah satu produk
		const firstProductLink = page.locator('a[href^="/produk/"]').first();
		await firstProductLink.click();
		await page.waitForURL(/\/produk\/.+/, { waitUntil: 'domcontentloaded' });

		// 4. Pilih varian jika ada dan klik tombol Tambah ke Keranjang
		const addToCartBtn = page.locator('button:has-text("Tambah ke Keranjang")');
		await expect(addToCartBtn).toBeVisible();
		await addToCartBtn.click();

		// Verifikasi indikator badge cart ter-update
		const cartBadge = page.locator('header a[href="/keranjang"]');
		await expect(cartBadge).toBeVisible();

		// 5. Buka halaman /keranjang
		await page.goto('/keranjang');
		await expect(page.locator('h1')).toContainText(/Keranjang Belanja/);

		// 6. Isi formulir pengiriman
		await page.locator('input[placeholder*="Nama"]').fill('Budi Wicaksono');
		await page.locator('input[placeholder*="08"]').fill('081234567890');
		await page.locator('textarea[placeholder*="alamat"]').fill('Jl. Kemang Raya No. 10, Jakarta Selatan');

		// 7. Klik Submit Pesanan sebagai guest -> harus diarahkan ke login dengan redirect param
		const submitBtn = page.locator('button[type="submit"]');
		await submitBtn.click();
		await page.waitForURL(/\/login\?redirect=.+/, { waitUntil: 'domcontentloaded' });

		// 8. Beralih ke tab Daftar Akun Baru
		const registerTab = page.locator('button:has-text("Daftar Akun Baru")');
		await registerTab.click();

		const uniqueEmail = `test.e2e.${Date.now()}@example.com`;
		await page.locator('input[placeholder="Nama lengkap Anda"]').fill('Budi Wicaksono');
		await page.locator('input[type="email"]').last().fill(uniqueEmail);
		await page.locator('input[type="password"]').nth(1).fill('P@ssword123!');
		await page.locator('input[type="password"]').nth(2).fill('P@ssword123!');

		// Submit registrasi
		const submitRegBtn = page.locator('button:has-text("Daftar Akun Maison")');
		await submitRegBtn.click();

		// 9. Harus otomatis redirect kembali ke /keranjang dan cart item tetap ada
		await page.waitForURL(/\/keranjang/, { waitUntil: 'domcontentloaded' });
		await expect(page.locator('text=Budi Wicaksono')).toBeVisible();

		// 10. Selesaikan pesanan sebagai user terautentikasi
		const finalSubmitBtn = page.locator('button[type="submit"]');
		await finalSubmitBtn.click();

		// 11. Verifikasi sampai ke halaman Konfirmasi Pesanan
		await page.waitForURL(/\/checkout\/konfirmasi\?order=.+/, { waitUntil: 'domcontentloaded' });
		await expect(page.locator('h1')).toContainText(/Pesanan Berhasil/);
		await expect(page.locator('text=Budi Wicaksono')).toBeVisible();
	});
});
