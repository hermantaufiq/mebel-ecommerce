<script lang="ts">
	import type { PageData } from './$types';
	import { formatRupiah, formatDateId } from '$lib/utils';
	import Printer from '@lucide/svelte/icons/printer';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	let { data }: { data: PageData } = $props();
	let order = $derived(data.order);

	const invoiceDate = $derived(formatDateId(order.createdAt));
	const invoiceNumber = $derived(
		`INV/${new Date(order.createdAt).getFullYear()}${String(new Date(order.createdAt).getMonth() + 1).padStart(2, '0')}/${order.orderNumber}`
	);

	function handlePrint() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}
</script>

<svelte:head>
	<title>E-Invoice #{order.orderNumber} | Maison Lumina Atelier</title>
	<meta name="description" content="Faktur Penjualan Resmi Maison Lumina Atelier untuk pesanan #{order.orderNumber}." />
</svelte:head>

<!-- Screen Container with oatmeal background -->
<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10 print:bg-white print:p-0">
	<div class="mx-auto max-w-4xl px-4 sm:px-6">
		<!-- Screen Action Bar (Hidden when printing) -->
		<div
			class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8DFD0] bg-white p-4 shadow-sm print:hidden"
		>
			<a
				href="/checkout/konfirmasi?order={order.orderNumber}"
				class="inline-flex items-center gap-2 rounded-xl border border-[#E8DFD0] bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50"
			>
				<ArrowLeft class="h-4 w-4" />
				<span>Kembali ke Konfirmasi Pesanan</span>
			</a>

			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={handlePrint}
					class="inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#B5652F]"
				>
					<Printer class="h-4 w-4" />
					<span>Cetak / Unduh PDF Faktur</span>
				</button>
			</div>
		</div>

		<!-- Official Invoice Paper (A4 proportions) -->
		<div
			class="invoice-sheet rounded-3xl border border-[#E8DFD0] bg-white p-8 sm:p-12 shadow-md print:rounded-none print:border-none print:p-0 print:shadow-none"
		>
			<!-- Invoice Header -->
			<div class="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-[#1F1810] pb-6">
				<div>
					<div class="flex items-center gap-2">
						<span class="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-[#1F1810] uppercase">
							Maison Lumina
						</span>
					</div>
					<span class="text-[11px] font-semibold tracking-wider text-[#B5652F] uppercase block mt-0.5">
						Haute Ébénisterie &amp; Atelier Furnitur Kayu
					</span>
					<div class="mt-3 text-xs text-stone-600 space-y-0.5 leading-relaxed">
						<p>PT Maison Lumina Indonesia</p>
						<p>Jl. Kemang Raya No. 42, Mampang Prapatan, Jakarta Selatan 12730</p>
						<p>Telepon: (021) 789-2341 | WhatsApp: +62 812-3456-7890</p>
						<!-- Koreksi 5: Placeholder Eksplisit NPWP -->
						<p class="font-mono text-[11px] text-stone-500 font-medium">NPWP: [ISI NPWP RESMI ATELIER]</p>
					</div>
				</div>

				<div class="text-left sm:text-right">
					<span class="inline-block rounded-lg bg-[#1F1810] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
						Faktur Penjualan
					</span>
					<div class="mt-3 text-xs text-stone-600 space-y-1">
						<div>
							<span class="text-stone-500 block text-[10px] uppercase font-semibold">Nomor Faktur</span>
							<span class="font-mono text-sm font-bold text-[#1F1810]">{invoiceNumber}</span>
						</div>
						<div>
							<span class="text-stone-500 block text-[10px] uppercase font-semibold">Tanggal Terbit</span>
							<span class="font-medium text-[#1F1810]">{invoiceDate}</span>
						</div>
						<div>
							<span class="text-stone-500 block text-[10px] uppercase font-semibold">Status Pembayaran</span>
							{#if order.paymentStatus === 'Paid' || order.paymentStatus === 'Lunas'}
								<span class="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
									<CheckCircle2 class="h-3 w-3" />
									LUNAS
								</span>
							{:else if order.paymentStatus === 'Cancelled' || order.status === 'Dibatalkan'}
								<span class="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
									DIBATALKAN
								</span>
							{:else}
								<span class="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
									MENUNGGU PEMBAYARAN
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Customer and Shipping Meta Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[#E8DFD0] text-xs">
				<div>
					<span class="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
						Informasi Pemesan (Bill To)
					</span>
					<div class="space-y-1 text-stone-800">
						<p class="font-serif text-sm font-bold text-[#1F1810]">{order.recipientName}</p>
						<p>{order.recipientPhone}</p>
						<p class="text-stone-600">{order.user?.email || 'Pelanggan Maison Lumina'}</p>
					</div>
				</div>

				<div>
					<span class="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
						Tujuan Pengiriman &amp; Perakitan (Ship To)
					</span>
					<div class="space-y-1 text-stone-800">
						<p class="leading-relaxed text-stone-700">{order.shippingAddress}</p>
						<div class="pt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600">
							<span>Jadwal: <strong>{order.deliveryDate ? formatDateId(order.deliveryDate) : 'Sesuai Konfirmasi'}</strong></span>
							<span>Slot: <strong>{order.deliverySlot || 'Pagi (09:00 - 12:00 WIB)'}</strong></span>
						</div>
						{#if order.installService}
							<p class="text-emerald-700 font-medium pt-0.5">
								✓ Layanan Perakitan Ahli di Lokasi: Termasuk (Gratis)
							</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Line Items Table -->
			<div class="py-6 border-b border-[#E8DFD0]">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="border-b border-[#1F1810] text-[#1F1810] font-semibold text-[11px] uppercase tracking-wider">
							<th class="py-2.5 w-10">No</th>
							<th class="py-2.5">Deskripsi Karya Furnitur</th>
							<th class="py-2.5 text-center w-16">Kuantitas</th>
							<th class="py-2.5 text-right w-28">Harga Satuan</th>
							<th class="py-2.5 text-right w-32">Jumlah</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#E8DFD0]/70 text-stone-800">
						{#each order.items as item, idx}
							<tr class="py-3">
								<td class="py-3 font-mono text-stone-500">{idx + 1}</td>
								<td class="py-3 pr-4">
									<span class="font-serif text-xs font-bold text-[#1F1810] block">
										{item.product?.name || 'Karya Mebel Maison'}
									</span>
									{#if item.variantLabel}
										<span class="text-[11px] text-[#B5652F] block">
											Spesifikasi: {item.variantLabel}
										</span>
									{/if}
									{#if item.product?.material}
										<span class="text-[10px] text-stone-500 block">
											Material: {item.product.material}
										</span>
									{/if}
								</td>
								<td class="py-3 text-center font-mono">{item.qty} unit</td>
								<td class="py-3 text-right font-mono">{formatRupiah(item.priceAtOrder)}</td>
								<td class="py-3 text-right font-mono font-bold text-[#1F1810]">
									{formatRupiah(item.priceAtOrder * item.qty)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Financial Summary & Payment Breakdown -->
			<div class="py-6 border-b border-[#E8DFD0] grid grid-cols-1 sm:grid-cols-12 gap-6 text-xs">
				<!-- Left: Payment details & Official Bank Accounts -->
				<div class="sm:col-span-7 space-y-3">
					<span class="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
						Metode Pembayaran
					</span>
					<div class="rounded-xl border border-[#E8DFD0] bg-[#FAF8F5] p-3.5 space-y-2 text-stone-700">
						<p class="font-semibold text-[#1F1810]">{order.paymentMethod}</p>
						<div class="text-[11px] space-y-1 text-stone-600">
							<p>Rekening Resmi: <strong>BCA 8830-1928-3741</strong> a.n. PT Maison Lumina Indonesia</p>
							<p>Rekening Mandiri: <strong>Mandiri 137-00-98213-441</strong> a.n. PT Maison Lumina Indonesia</p>
						</div>
					</div>

					{#if order.deliveryNote}
						<div class="text-[11px] text-stone-500 italic">
							Catatan Khusus: {order.deliveryNote}
						</div>
					{/if}
				</div>

				<!-- Right: Cost Totals -->
				<div class="sm:col-span-5 space-y-2 text-xs">
					<div class="flex justify-between text-stone-600">
						<span>Subtotal</span>
						<span class="font-mono font-medium text-[#1F1810]">{formatRupiah(order.subtotal)}</span>
					</div>
					<div class="flex justify-between text-stone-600">
						<span>Pengiriman Jabodetabek</span>
						<span class="font-semibold text-emerald-700">Gratis (Rp 0)</span>
					</div>
					<div class="flex justify-between text-stone-600">
						<span>Jasa Perakitan Ahli</span>
						<span class="font-semibold text-emerald-700">Gratis (Rp 0)</span>
					</div>
					<div class="flex justify-between text-stone-600">
						<span>PPN (11%)</span>
						<span class="font-mono font-medium text-[#1F1810]">{formatRupiah(order.tax)}</span>
					</div>
					<div class="flex justify-between border-t-2 border-[#1F1810] pt-2.5 text-sm font-bold text-[#1F1810]">
						<span class="font-serif">Total Faktur</span>
						<span class="font-serif text-base text-[#B5652F]">{formatRupiah(order.total)}</span>
					</div>
				</div>
			</div>

			<!-- Official Seal, Signature & Warranty Notice -->
			<div class="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end text-xs">
				<div class="space-y-2">
					<div class="flex items-center gap-2 text-stone-800 font-semibold">
						<ShieldCheck class="h-4 w-4 text-[#B5652F]" />
						<span>Jaminan Mutu &amp; Garansi Atelier</span>
					</div>
					<p class="text-[11px] text-stone-500 leading-relaxed">
						Setiap furnitur Maison Lumina dilindungi oleh garansi integritas konstruksi dan rangka kayu jati solid selama 5 tahun sejak tanggal penyerahan.
					</p>
					<p class="text-[10px] text-stone-400">
						Dokumen ini dihasilkan secara otomatis oleh sistem administrasi Maison Lumina dan sah tanpa tanda tangan basah fisik.
					</p>
				</div>

				<div class="flex flex-col items-start sm:items-end text-left sm:text-right">
					<div class="inline-block rounded-xl border border-[#D4AF37] bg-[#FAF8F5] px-4 py-2 text-center">
						<span class="text-[9px] font-bold uppercase tracking-widest text-[#B5652F] block">
							MAISON LUMINA OFFICIAL
						</span>
						<span class="font-serif text-xs font-bold text-[#1F1810] block">
							VERIFIED ATELIER SEAL
						</span>
						<span class="text-[9px] font-mono text-stone-500 block">
							AUTH-KEY: {order.orderNumber}
						</span>
					</div>
					<span class="text-[10px] text-stone-400 mt-2 block">
						Jakarta, {invoiceDate}
					</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@media print {
		:global(body) {
			background: white !important;
			color: #1f1810 !important;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		:global(nav),
		:global(header),
		:global(footer) {
			display: none !important;
		}

		.invoice-sheet {
			border: none !important;
			box-shadow: none !important;
			padding: 0 !important;
			max-width: 100% !important;
			width: 100% !important;
		}

		tr {
			break-inside: avoid;
		}
	}
</style>
