<script lang="ts">
	import type { PageData } from './$types';
	import { formatRupiah, formatDateId } from '$lib/utils';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import { Badge } from '$lib/components/ui/badge';

	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Clock from '@lucide/svelte/icons/clock';
	import Package from '@lucide/svelte/icons/package';
	import Truck from '@lucide/svelte/icons/truck';
	import Home from '@lucide/svelte/icons/home';
	import Printer from '@lucide/svelte/icons/printer';
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import Phone from '@lucide/svelte/icons/phone';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Calendar from '@lucide/svelte/icons/calendar';

	let { data }: { data: PageData } = $props();
	let order = $derived(data.order);

	let copied = $state(false);

	function copyOrderNumber() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(order.orderNumber);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	function handlePrint() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}
</script>

<svelte:head>
	<title>Konfirmasi Pesanan #{order.orderNumber} | Maison Lumina</title>
	<meta name="description" content="Konfirmasi pesanan dan instruksi pengiriman furnitur Maison Lumina." />
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<div class="mb-6 print:hidden">
			<Breadcrumb
				items={[
					{ label: 'Beranda', href: '/' },
					{ label: 'Keranjang', href: '/keranjang' },
					{ label: `Pesanan #${order.orderNumber}` }
				]}
			/>
		</div>

		<!-- Success Hero Banner -->
		<div class="rounded-3xl border border-[#E8DFD0] bg-white p-8 sm:p-10 shadow-sm text-center">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
				<CheckCircle2 class="h-10 w-10 text-emerald-600" />
			</div>

			<Badge class="mt-4 bg-emerald-100 text-emerald-800 border-none px-3 py-1 text-xs font-semibold">
				Pesanan Berhasil Dibuat
			</Badge>

			<h1 class="mt-3 font-serif text-3xl font-bold text-[#1F1810] sm:text-4xl">
				Terima Kasih Atas Pesanan Anda
			</h1>
			<p class="mx-auto mt-2 max-w-lg text-sm text-stone-600 leading-relaxed">
				Pesanan furnitur Anda telah tercatat dalam sistem produksi atelier kami dan segera disiapkan untuk pengiriman.
			</p>

			<!-- Order Number & Copy Box -->
			<div class="mx-auto mt-6 inline-flex items-center gap-3 rounded-xl border border-[#E8DFD0] bg-[#F7F3EC] px-5 py-2.5">
				<div>
					<span class="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Nomor Pesanan</span>
					<span class="font-serif text-lg font-bold text-[#1F1810] tracking-wider">{order.orderNumber}</span>
				</div>
				<button
					type="button"
					onclick={copyOrderNumber}
					class="p-2 rounded-lg bg-white text-stone-600 hover:text-[#1F1810] transition-colors border border-[#E8DFD0] shadow-xs"
					title="Salin nomor pesanan"
					aria-label="Salin nomor pesanan"
				>
					{#if copied}
						<Check class="h-4 w-4 text-emerald-600" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Status Timeline Stepper -->
		<div class="my-8 rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm">
			<h2 class="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-6 text-center">
				Status Pesanan Real-Time
			</h2>

			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<!-- Step 1: Diterima -->
				<div class="flex flex-col items-center text-center">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1810] text-white shadow-sm mb-2">
						<Clock class="h-5 w-5" />
					</div>
					<span class="text-xs font-bold text-[#1F1810]">1. Diterima</span>
					<span class="text-[11px] text-stone-500 mt-0.5">Menunggu Pembayaran</span>
				</div>

				<!-- Step 2: Disiapkan -->
				<div class="flex flex-col items-center text-center opacity-60">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 border border-[#E8DFD0] text-stone-500 mb-2">
						<Package class="h-5 w-5" />
					</div>
					<span class="text-xs font-semibold text-stone-700">2. Disiapkan</span>
					<span class="text-[11px] text-stone-500 mt-0.5">Inspeksi Kayu &amp; QC</span>
				</div>

				<!-- Step 3: Dikirim -->
				<div class="flex flex-col items-center text-center opacity-60">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 border border-[#E8DFD0] text-stone-500 mb-2">
						<Truck class="h-5 w-5" />
					</div>
					<span class="text-xs font-semibold text-stone-700">3. Dikirim</span>
					<span class="text-[11px] text-stone-500 mt-0.5">Armada Khusus Atelier</span>
				</div>

				<!-- Step 4: Selesai & Dirakit -->
				<div class="flex flex-col items-center text-center opacity-60">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 border border-[#E8DFD0] text-stone-500 mb-2">
						<Home class="h-5 w-5" />
					</div>
					<span class="text-xs font-semibold text-stone-700">4. Selesai</span>
					<span class="text-[11px] text-stone-500 mt-0.5">Perakitan di Lokasi</span>
				</div>
			</div>
		</div>

		<!-- 2-Column Grid: Details & Payment -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
			<!-- Left Column: Delivery Details & Items (7 cols) -->
			<div class="lg:col-span-7 space-y-6">
				<!-- Delivery Details Card -->
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-4">
					<div class="flex items-center gap-2 border-b border-[#E8DFD0] pb-3">
						<Truck class="h-5 w-5 text-[#B5652F]" />
						<h2 class="font-serif text-lg font-semibold text-[#1F1810]">
							Jadwal &amp; Alamat Pengiriman
						</h2>
					</div>

					<div class="space-y-3 text-xs text-stone-700">
						<div>
							<span class="text-stone-500 block font-medium">Penerima</span>
							<span class="font-semibold text-sm text-[#1F1810]">{order.recipientName} ({order.recipientPhone})</span>
						</div>

						<div>
							<span class="text-stone-500 block font-medium">Alamat Pengantaran</span>
							<p class="font-medium text-[#1F1810] leading-relaxed mt-0.5">
								{order.shippingAddress}
							</p>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E8DFD0]/60 pt-3">
							<div>
								<span class="text-stone-500 block font-medium flex items-center gap-1">
									<Calendar class="h-3.5 w-3.5 text-[#B5652F]" />
									Tanggal Pengiriman
								</span>
								<span class="font-semibold text-[#1F1810]">
									{order.deliveryDate ? formatDateId(order.deliveryDate) : 'Sesuai Kesepakatan'}
								</span>
							</div>

							<div>
								<span class="text-stone-500 block font-medium flex items-center gap-1">
									<Clock class="h-3.5 w-3.5 text-[#B5652F]" />
									Slot Waktu Kedatangan
								</span>
								<span class="font-semibold text-[#1F1810]">
									{order.deliverySlot || 'Pagi (09:00 - 12:00 WIB)'}
								</span>
							</div>
						</div>

						{#if order.installService}
							<div class="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2.5 text-emerald-800">
								<Wrench class="h-4 w-4 text-emerald-600 shrink-0" />
								<span>Jasa Perakitan di Tempat: <strong>Aktif (Gratis oleh Tim Maison Lumina)</strong></span>
							</div>
						{/if}

						{#if order.deliveryNote}
							<div class="border-t border-[#E8DFD0]/60 pt-2 text-[11px] text-stone-500 italic">
								Catatan: {order.deliveryNote}
							</div>
						{/if}
					</div>
				</div>

				<!-- Purchased Items -->
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm">
					<h2 class="font-serif text-lg font-semibold text-[#1F1810] border-b border-[#E8DFD0] pb-3 mb-4">
						Daftar Furnitur yang Dipesan
					</h2>

					<div class="divide-y divide-[#E8DFD0]/60">
						{#each order.items as item}
							<div class="flex items-center justify-between py-3 gap-4">
								<div class="flex items-center gap-3">
									{#if item.product?.images?.[0]?.url}
										<img
											src={item.product.images[0].url}
											alt={item.product.name}
											class="h-16 w-20 shrink-0 rounded-lg object-cover border border-[#E8DFD0] bg-[#EDE4D7]"
										/>
									{/if}
									<div>
										<span class="font-serif text-sm font-semibold text-[#1F1810] block">
											{item.product?.name || 'Produk Mebel'}
										</span>
										{#if item.variantLabel}
											<span class="text-xs text-[#B5652F] font-medium block">
												Varian: {item.variantLabel}
											</span>
										{/if}
										<span class="text-xs text-stone-500">
											Kuantitas: {item.qty} unit
										</span>
									</div>
								</div>

								<div class="text-right">
									<span class="font-serif text-sm font-bold text-[#1F1810]">
										{formatRupiah(item.priceAtOrder * item.qty)}
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Column: Payment Details & Action (5 cols) -->
			<div class="lg:col-span-5 space-y-6">
				<!-- Payment Instructions Card -->
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-4">
					<h2 class="font-serif text-lg font-semibold text-[#1F1810] border-b border-[#E8DFD0] pb-2">
						Instruksi Pembayaran
					</h2>

					<div class="flex items-center justify-between text-xs">
						<span class="text-stone-500">Status Pembayaran:</span>
						<Badge class="bg-amber-100 text-amber-800 border-none px-2 py-0.5 font-semibold">
							{order.paymentStatus || 'Pending'}
						</Badge>
					</div>

					<div class="flex items-center justify-between text-xs">
						<span class="text-stone-500">Metode Pembayaran:</span>
						<span class="font-semibold text-[#1F1810]">{order.paymentMethod}</span>
					</div>

					<!-- Virtual Account / Bank Details -->
					<div class="rounded-xl border border-[#E8DFD0] bg-[#F7F3EC] p-4 space-y-3">
						<span class="text-xs font-semibold text-[#1F1810] block">
							Rekening Resmi PT Maison Lumina Atelier:
						</span>
						<div class="border-b border-[#E8DFD0] pb-2 text-xs">
							<span class="text-stone-500 block">Bank Central Asia (BCA)</span>
							<span class="font-mono text-sm font-bold text-[#1F1810]">8830-1928-3741</span>
						</div>
						<div class="text-xs">
							<span class="text-stone-500 block">Bank Mandiri</span>
							<span class="font-mono text-sm font-bold text-[#1F1810]">137-00-98213-441</span>
						</div>
					</div>

					<!-- Cost Breakdown -->
					<div class="space-y-2 border-t border-[#E8DFD0] pt-3 text-xs text-stone-600">
						<div class="flex justify-between">
							<span>Subtotal</span>
							<span class="font-medium text-[#1F1810]">{formatRupiah(order.subtotal)}</span>
						</div>
						<div class="flex justify-between">
							<span>Pengiriman Jabodetabek</span>
							<span class="font-semibold text-emerald-700">Gratis</span>
						</div>
						<div class="flex justify-between">
							<span>Jasa Perakitan Ahli</span>
							<span class="font-semibold text-emerald-700">Gratis</span>
						</div>
						<div class="flex justify-between">
							<span>PPN (11%)</span>
							<span class="font-medium text-[#1F1810]">{formatRupiah(order.tax)}</span>
						</div>
						<div class="flex justify-between border-t border-[#E8DFD0] pt-2 text-sm font-bold text-[#1F1810]">
							<span class="font-serif">Total Pembayaran</span>
							<span class="font-serif text-lg text-[#B5652F]">{formatRupiah(order.total)}</span>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="space-y-2 pt-3 print:hidden">
						<button
							type="button"
							onclick={handlePrint}
							class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F1810] py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#B5652F]"
						>
							<Printer class="h-4 w-4" />
							<span>Cetak / Simpan E-Invoice</span>
						</button>

						<a
							href="/"
							class="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8DFD0] bg-white py-2.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50"
						>
							<span>Kembali ke Beranda</span>
						</a>
					</div>
				</div>

				<!-- Concierge Help -->
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-5 shadow-sm space-y-3 print:hidden">
					<div class="flex items-center gap-2 text-xs font-semibold text-[#1F1810]">
						<Phone class="h-4 w-4 text-[#B5652F]" />
						<span>Butuh Bantuan atau Kustomisasi Tambahan?</span>
					</div>
					<p class="text-xs text-stone-600 leading-relaxed">
						Layanan concierge siap membantu Anda melalui WhatsApp untuk mengatur penyesuaian jadwal atau instruksi penataan ruang.
					</p>
					<a
						href="https://wa.me/6281234567890?text=Halo%20Maison%20Lumina,%20saya%20ingin%20menanyakan%20pesanan%20{order.orderNumber}"
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-2 text-xs font-semibold text-[#B5652F] hover:underline"
					>
						Hubungi Concierge WhatsApp &rarr;
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
