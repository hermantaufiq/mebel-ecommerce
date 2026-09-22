<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { formatRupiah } from '$lib/utils';
	import { calculateCartTotals } from '$lib/cart-calculations';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import { goto } from '$app/navigation';

	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';
	import Minus from '@lucide/svelte/icons/minus';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Truck from '@lucide/svelte/icons/truck';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Clock from '@lucide/svelte/icons/clock';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Info from '@lucide/svelte/icons/info';

	let { data }: { data: PageData } = $props();

	// Form delivery states initialized from authenticated user or defaults
	let recipientName = $state('');
	let recipientPhone = $state('');
	let shippingAddress = $state('');
	let deliveryNote = $state('');

	$effect(() => {
		if (!recipientName) recipientName = data.user?.name || data.defaultAddress?.recipient || '';
		if (!recipientPhone) recipientPhone = data.defaultAddress?.phone || '081234567890';
		if (!shippingAddress) shippingAddress = data.defaultAddress?.fullAddress || 'Jl. Kemang Raya No. 45, Jakarta Selatan 12730';
		if (!deliveryNote) deliveryNote = data.defaultAddress?.notes || 'Tolong kabari 30 menit sebelum tiba. Unit di lantai 2.';
	});

	// Earliest delivery date is H+2
	const defaultDeliveryDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
	let deliveryDate = $state(defaultDeliveryDate);
	let deliverySlot = $state('Pagi (09:00 - 12:00 WIB)');
	let installService = $state(true);
	let paymentMethod = $state('Transfer Bank (BCA / Mandiri VA)');

	// Submission & stock validation state
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let stockNotice = $state('');
	let isValidatingStock = $state(false);
	let adjustedItemIds = $state<string[]>([]);

	// Real-time stock validation upon opening /keranjang (tidak percaya cache localStorage murni)
	onMount(async () => {
		// Restore pending checkout form filled by guest before login redirect
		if (typeof window !== 'undefined') {
			try {
				const savedForm = sessionStorage.getItem('maison_pending_checkout');
				if (savedForm) {
					const parsed = JSON.parse(savedForm);
					if (parsed.recipientName) recipientName = parsed.recipientName;
					if (parsed.recipientPhone) recipientPhone = parsed.recipientPhone;
					if (parsed.shippingAddress) shippingAddress = parsed.shippingAddress;
					if (parsed.deliveryNote) deliveryNote = parsed.deliveryNote;
					if (parsed.deliveryDate) deliveryDate = parsed.deliveryDate;
					if (parsed.deliverySlot) deliverySlot = parsed.deliverySlot;
					if (parsed.paymentMethod) paymentMethod = parsed.paymentMethod;
					if (parsed.installService !== undefined) installService = parsed.installService;
					sessionStorage.removeItem('maison_pending_checkout');
				}
			} catch (e) {
				console.warn('Failed to restore pending checkout form:', e);
			}
		}

		if (cartStore.items.length === 0) return;
		isValidatingStock = true;
		try {
			const res = await fetch('/api/cart/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: cartStore.items })
			});
			if (res.ok) {
				const result = await res.json();
				if (result.items) {
					const { adjustedCount, removedCount, adjustedItemIds: ids } = cartStore.syncWithValidated(result.items);
					adjustedItemIds = ids;
					if (removedCount > 0 || adjustedCount > 0) {
						stockNotice = `Catatan: Ketersediaan ${adjustedCount + removedCount} produk telah diverifikasi dan disesuaikan dengan stok atelier terbaru.`;
					}
				}
			}
		} catch (err) {
			console.warn('Gagal memvalidasi stok keranjang:', err);
		} finally {
			isValidatingStock = false;
		}
	});

	// Reactive totals
	let totals = $derived(
		calculateCartTotals(cartStore.items, {
			shippingFee: 0,
			installFee: 0,
			applyTax: true
		})
	);

	async function handleCheckout(e: SubmitEvent) {
		e.preventDefault();
		if (cartStore.items.length === 0) return;

		// 1. Enforce login before checkout (Pola Shopee: simpan form & redirect dengan ramah)
		if (!data.user) {
			if (typeof window !== 'undefined') {
				try {
					sessionStorage.setItem(
						'maison_pending_checkout',
						JSON.stringify({
							recipientName,
							recipientPhone,
							shippingAddress,
							deliveryNote,
							deliveryDate,
							deliverySlot,
							installService,
							paymentMethod
						})
					);
				} catch {}
			}
			goto(`/login?redirect=${encodeURIComponent('/keranjang')}&from=checkout`);
			return;
		}

		if (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim()) {
			errorMessage = 'Harap lengkapi nama penerima, nomor telepon, dan alamat pengiriman.';
			return;
		}

		errorMessage = '';
		isSubmitting = true;

		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					items: cartStore.items,
					recipientName,
					recipientPhone,
					shippingAddress,
					deliveryNote,
					deliveryDate,
					deliverySlot,
					installService,
					paymentMethod
				})
			});

			const resData = await res.json();

			if (!res.ok) {
				if (resData.requireLogin) {
					goto(`/login?redirect=${encodeURIComponent('/keranjang')}`);
					return;
				}
				throw new Error(resData.error || 'Gagal memproses pesanan Anda');
			}

			// Clear cart and redirect to confirmation page
			cartStore.clearCart();
			goto(`/checkout/konfirmasi?order=${resData.orderNumber}`);
		} catch (err: any) {
			console.error('Checkout failed:', err);
			errorMessage = err.message || 'Terjadi kesalahan saat memproses pesanan.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Keranjang Belanja &amp; Checkout | Maison Lumina</title>
	<meta name="description" content="Selesaikan pesanan furnitur berkualitas tinggi Anda di Maison Lumina." />
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<Breadcrumb
				items={[
					{ label: 'Beranda', href: '/' },
					{ label: 'Keranjang Belanja' }
				]}
			/>
		</div>

		{#if cartStore.items.length === 0}
			<!-- Empty Cart State -->
			<div class="rounded-3xl border border-[#E8DFD0] bg-white/70 px-6 py-20 text-center backdrop-blur-sm shadow-sm">
				<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE4D7] text-[#B5652F]">
					<ShoppingBag class="h-10 w-10 text-[#B5652F]" />
				</div>
				<h1 class="mt-6 font-serif text-2xl font-bold text-[#1F1810] sm:text-3xl">
					Keranjang Belanja Anda Masih Kosong
				</h1>
				<p class="mx-auto mt-2 max-w-md text-sm text-stone-600 leading-relaxed">
					Temukan koleksi furnitur berkualitas karya para pengrajin terbaik Jepara untuk melengkapi hunian idaman Anda.
				</p>
				<div class="mt-8">
					<a
						href="/produk"
						class="inline-flex items-center gap-2 rounded-lg bg-[#1F1810] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#B5652F]"
					>
						<span>Jelajahi Katalog Furnitur</span>
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		{:else}
			<!-- Page Header -->
			<div class="mb-8 border-b border-[#E8DFD0] pb-5">
				<h1 class="font-serif text-3xl font-bold text-[#1F1810] sm:text-4xl">
					Keranjang Belanja &amp; Pengiriman
					{#if isValidatingStock}
						<span class="text-xs text-stone-400 font-normal font-sans animate-pulse ml-2">Memverifikasi stok...</span>
					{/if}
				</h1>
				<p class="mt-2 text-sm text-stone-600">
					Tinjau pilihan furnitur Anda dan tentukan jadwal perakitan langsung di lokasi.
				</p>
			</div>

			<!-- Guest Reminder Banner (Non-intrusive Pola Shopee) -->
			{#if !data.user}
				<div class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-950 shadow-2xs backdrop-blur-xs">
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-[#B5652F] shrink-0">
							<Info class="h-4 w-4" />
						</div>
						<div class="space-y-0.5">
							<p class="font-semibold text-amber-950">
								Anda sedang menjelajah sebagai Tamu
							</p>
							<p class="text-stone-600">
								Semua produk di keranjang Anda tersimpan aman. Masuk atau daftar akun untuk menyelesaikan pesanan &amp; memantau proses pengiriman.
							</p>
						</div>
					</div>
					<a
						href="/login?redirect={encodeURIComponent('/keranjang')}&from=checkout"
						class="shrink-0 rounded-lg bg-amber-100 px-3.5 py-1.5 font-semibold text-[#B5652F] hover:bg-amber-200 transition-colors"
					>
						Masuk / Daftar &rarr;
					</a>
				</div>
			{/if}
 
			{#if stockNotice}
				<div class="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-xs text-sky-950 shadow-2xs">
					<div class="flex items-center gap-2.5">
						<Info class="h-4 w-4 text-sky-600 shrink-0" />
						<span>{stockNotice}</span>
					</div>
					<button type="button" onclick={() => (stockNotice = '')} class="text-sky-500 hover:text-sky-700 font-bold px-1">✕</button>
				</div>
			{/if}

			<!-- Main 2-Column Grid -->
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
				<!-- Left Column: Cart Items & Special Furniture Services (7 cols) -->
				<div class="lg:col-span-7 space-y-8">
					<!-- Cart Items List -->
					<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between border-b border-[#E8DFD0] pb-3">
							<h2 class="font-serif text-lg font-semibold text-[#1F1810]">
								Item Pesanan ({cartStore.itemCount} unit)
							</h2>
							<button
								type="button"
								onclick={() => cartStore.clearCart()}
								class="text-xs font-medium text-stone-500 hover:text-rose-600 transition-colors"
							>
								Kosongkan Semua
							</button>
						</div>

						<div class="divide-y divide-[#E8DFD0]/60">
							{#each cartStore.items as item (item.id)}
								<div class="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
									<div class="flex items-center gap-4">
										<a
											href="/produk/{item.slug || ''}"
											class="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#EDE4D7] border border-[#E8DFD0]"
										>
											<img
												src={item.image}
												alt={item.name}
												class="h-full w-full object-cover"
											/>
										</a>
										<div>
											<a
												href="/produk/{item.slug || ''}"
												class="font-serif text-sm font-semibold text-[#1F1810] hover:text-[#B5652F] transition-colors"
											>
												{item.name}
											</a>
											{#if item.variantLabel}
												<p class="text-xs text-[#B5652F] font-medium mt-0.5">
													Varian: {item.variantLabel}
												</p>
											{/if}
											{#if item.material}
												<p class="text-xs text-stone-500 mt-0.5">
													{item.material}
												</p>
											{/if}
											{#if adjustedItemIds.includes(item.id)}
												<div class="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900 border border-amber-200">
													<AlertCircle class="h-3.5 w-3.5 text-amber-600 shrink-0" />
													<span>Jumlah disesuaikan dengan stok tersedia ({item.maxStock} unit)</span>
												</div>
											{/if}
											<p class="mt-1 text-xs font-semibold text-stone-700 sm:hidden">
												{formatRupiah(item.unitPrice)} / unit
											</p>
										</div>
									</div>

									<div class="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
										<!-- Price (Desktop) -->
										<div class="text-right hidden sm:block">
											<span class="font-serif text-sm font-bold text-[#1F1810] block">
												{formatRupiah(item.unitPrice * item.qty)}
											</span>
											{#if item.qty > 1}
												<span class="text-[11px] text-stone-500">
													({formatRupiah(item.unitPrice)} / unit)
												</span>
											{/if}
										</div>

										<!-- Stepper Quantity -->
										<div class="flex items-center rounded-lg border border-[#E8DFD0] bg-[#F7F3EC]/50">
											<button
												type="button"
												onclick={() => cartStore.decrementQty(item.id)}
												class="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:text-[#1F1810]"
												title={item.qty === 1 ? 'Hapus item dari keranjang' : 'Kurangi kuantitas'}
												aria-label="Kurangi kuantitas"
											>
												{#if item.qty === 1}
													<Trash2 class="h-3.5 w-3.5 text-rose-600" />
												{:else}
													<Minus class="h-3.5 w-3.5" />
												{/if}
											</button>
											<span class="w-8 text-center text-xs font-semibold text-[#1F1810]">
												{item.qty}
											</span>
											<button
												type="button"
												onclick={() => cartStore.incrementQty(item.id)}
												disabled={item.qty >= item.maxStock}
												class="flex h-8 w-8 items-center justify-center text-stone-600 transition-colors hover:text-[#1F1810] disabled:opacity-40"
												aria-label="Tambah kuantitas"
											>
												<Plus class="h-3.5 w-3.5" />
											</button>
										</div>

										<!-- Total on mobile -->
										<span class="font-serif text-sm font-bold text-[#1F1810] sm:hidden">
											{formatRupiah(item.unitPrice * item.qty)}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Layanan Khusus Furnitur -->
					<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-6">
						<div class="flex items-center gap-2 border-b border-[#E8DFD0] pb-3">
							<Truck class="h-5 w-5 text-[#B5652F]" />
							<h2 class="font-serif text-lg font-semibold text-[#1F1810]">
								Layanan Pengiriman &amp; Perakitan Khusus
							</h2>
						</div>

						<!-- Jasa Perakitan Checkbox -->
						<div class="rounded-xl border border-[#B5652F]/30 bg-[#B5652F]/5 p-4 flex items-start gap-3">
							<input
								id="install-checkbox"
								type="checkbox"
								bind:checked={installService}
								class="mt-1 h-4 w-4 rounded border-stone-300 text-[#B5652F] focus:ring-[#B5652F]"
							/>
							<label for="install-checkbox" class="text-xs text-stone-700 leading-relaxed cursor-pointer">
								<span class="font-semibold text-[#1F1810] block text-sm flex items-center gap-2">
									<Wrench class="h-4 w-4 text-[#B5652F]" />
									Jasa Perakitan di Tempat (Gratis)
								</span>
								Tim ahli mebel Maison Lumina akan merakit, menguji kestabilan konstruksi, dan menata furnitur langsung di lokasi ruangan Anda tanpa biaya tambahan.
							</label>
						</div>

						<!-- Tanggal & Slot Waktu -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label for="delivery-date" class="block text-xs font-semibold text-[#1F1810] mb-1.5 flex items-center gap-1.5">
									<Calendar class="h-3.5 w-3.5 text-[#B5652F]" />
									Tanggal Pengiriman Pilihan
								</label>
								<input
									id="delivery-date"
									type="date"
									min={defaultDeliveryDate}
									bind:value={deliveryDate}
									class="w-full rounded-lg border border-[#E8DFD0] bg-white px-3 py-2 text-xs font-medium text-[#1F1810] shadow-sm focus:border-[#B5652F] focus:outline-none"
								/>
								<span class="text-[11px] text-stone-500 mt-1 block">
									*Minimal H+2 untuk persiapan inspeksi QC kayu
								</span>
							</div>

							<div>
								<label for="delivery-slot" class="block text-xs font-semibold text-[#1F1810] mb-1.5 flex items-center gap-1.5">
									<Clock class="h-3.5 w-3.5 text-[#B5652F]" />
									Slot Waktu Kedatangan
								</label>
								<select
									id="delivery-slot"
									bind:value={deliverySlot}
									class="w-full rounded-lg border border-[#E8DFD0] bg-white px-3 py-2 text-xs font-medium text-[#1F1810] shadow-sm focus:border-[#B5652F] focus:outline-none"
								>
									<option value="Pagi (09:00 - 12:00 WIB)">Pagi (09:00 - 12:00 WIB)</option>
									<option value="Siang (13:00 - 16:00 WIB)">Siang (13:00 - 16:00 WIB)</option>
									<option value="Sore (16:00 - 19:00 WIB)">Sore (16:00 - 19:00 WIB)</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Column: Shipping Details Form & Order Summary (5 cols) -->
				<div class="lg:col-span-5 space-y-6">
					<form onsubmit={handleCheckout} class="space-y-6">
						<!-- Informasi Penerima -->
						<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-4">
							<h2 class="font-serif text-lg font-semibold text-[#1F1810] border-b border-[#E8DFD0] pb-2">
								Informasi Pengiriman
							</h2>

							<div>
								<label for="recipient-name" class="block text-xs font-medium text-stone-700 mb-1">
									Nama Penerima *
								</label>
								<input
									id="recipient-name"
									type="text"
									required
									bind:value={recipientName}
									placeholder="Contoh: Dian Sastrowardoyo"
									class="w-full rounded-lg border border-[#E8DFD0] px-3 py-2 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
								/>
							</div>

							<div>
								<label for="recipient-phone" class="block text-xs font-medium text-stone-700 mb-1">
									Nomor Telepon / WhatsApp *
								</label>
								<input
									id="recipient-phone"
									type="tel"
									required
									bind:value={recipientPhone}
									placeholder="Contoh: 081234567890"
									class="w-full rounded-lg border border-[#E8DFD0] px-3 py-2 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
								/>
							</div>

							<div>
								<label for="shipping-address" class="block text-xs font-medium text-stone-700 mb-1">
									Alamat Lengkap Pengiriman *
								</label>
								<textarea
									id="shipping-address"
									required
									rows="3"
									bind:value={shippingAddress}
									placeholder="Alamat jalan, nomor rumah/unit, RT/RW, kecamatan, kota..."
									class="w-full rounded-lg border border-[#E8DFD0] px-3 py-2 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
								></textarea>
							</div>

							<div>
								<label for="delivery-note" class="block text-xs font-medium text-stone-700 mb-1">
									Catatan Pengiriman (Opsional)
								</label>
								<input
									id="delivery-note"
									type="text"
									bind:value={deliveryNote}
									placeholder="Contoh: Naik lift barang, titip ke resepsionis jika tidak di tempat"
									class="w-full rounded-lg border border-[#E8DFD0] px-3 py-2 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
								/>
							</div>
						</div>

						<!-- Ringkasan & Metode Pembayaran -->
						<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-5">
							<h2 class="font-serif text-lg font-semibold text-[#1F1810] border-b border-[#E8DFD0] pb-2">
								Ringkasan &amp; Pembayaran
							</h2>

							<!-- Cost Breakdown -->
							<div class="space-y-2 text-xs text-stone-600">
								<div class="flex justify-between">
									<span>Subtotal Produk</span>
									<span class="font-medium text-[#1F1810]">{formatRupiah(totals.subtotal)}</span>
								</div>
								<div class="flex justify-between">
									<span>Pengiriman Khusus Jabodetabek</span>
									<span class="font-semibold text-emerald-700">Gratis</span>
								</div>
								<div class="flex justify-between">
									<span>Jasa Perakitan Ahli</span>
									<span class="font-semibold text-emerald-700">Gratis</span>
								</div>
								<div class="flex justify-between">
									<span>PPN (11% Terhitung)</span>
									<span class="font-medium text-[#1F1810]">{formatRupiah(totals.tax)}</span>
								</div>

								<div class="border-t border-[#E8DFD0] pt-3 mt-3 flex justify-between items-baseline">
									<span class="font-serif text-sm font-bold text-[#1F1810]">Total Pembayaran</span>
									<span class="font-serif text-2xl font-bold text-[#1F1810]">
										{formatRupiah(totals.total)}
									</span>
								</div>
							</div>

							<!-- Payment Method Selection -->
							<div class="space-y-2 pt-2 border-t border-[#E8DFD0]">
								<span class="block text-xs font-semibold text-[#1F1810]">Metode Pembayaran</span>

								<div class="space-y-2">
									<label
										class="flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all {paymentMethod.includes('Transfer') ? 'border-[#1F1810] bg-[#1F1810]/5' : 'border-[#E8DFD0] hover:border-stone-400'}"
									>
										<div class="flex items-center gap-3">
											<input
												type="radio"
												name="payment"
												value="Transfer Bank (BCA / Mandiri VA)"
												bind:group={paymentMethod}
												class="text-[#1F1810] focus:ring-[#1F1810]"
											/>
											<span class="text-xs font-medium text-[#1F1810]">Transfer Bank (BCA / Mandiri VA)</span>
										</div>
										<Building2 class="h-4 w-4 text-stone-500" />
									</label>

									<label
										class="flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all {paymentMethod.includes('Cicilan') ? 'border-[#1F1810] bg-[#1F1810]/5' : 'border-[#E8DFD0] hover:border-stone-400'}"
									>
										<div class="flex items-center gap-3">
											<input
												type="radio"
												name="payment"
												value="Cicilan 0% (Hingga 12 Bulan)"
												bind:group={paymentMethod}
												class="text-[#1F1810] focus:ring-[#1F1810]"
											/>
											<span class="text-xs font-medium text-[#1F1810]">Cicilan 0% (Hingga 12 Bulan)</span>
										</div>
										<CreditCard class="h-4 w-4 text-stone-500" />
									</label>

									<label
										class="flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all {paymentMethod.includes('QRIS') ? 'border-[#1F1810] bg-[#1F1810]/5' : 'border-[#E8DFD0] hover:border-stone-400'}"
									>
										<div class="flex items-center gap-3">
											<input
												type="radio"
												name="payment"
												value="QRIS / E-Wallet Instan"
												bind:group={paymentMethod}
												class="text-[#1F1810] focus:ring-[#1F1810]"
											/>
											<span class="text-xs font-medium text-[#1F1810]">QRIS / E-Wallet Instan</span>
										</div>
										<QrCode class="h-4 w-4 text-stone-500" />
									</label>
								</div>
							</div>

							{#if errorMessage}
								<div class="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-700">
									<AlertCircle class="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
									<span>{errorMessage}</span>
								</div>
							{/if}

							<!-- Submit Button -->
							<button
								type="submit"
								disabled={isSubmitting || cartStore.items.length === 0}
								class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5652F] py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#9E5424] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if isSubmitting}
									<Loader2 class="h-4 w-4 animate-spin text-white" />
									<span>Memproses Pesanan...</span>
								{:else}
									<ShieldCheck class="h-4 w-4 shrink-0" />
									<span class="hidden sm:inline">Buat Pesanan &amp; Lanjutkan ({formatRupiah(totals.total)})</span>
									<span class="sm:hidden">Bayar Sekarang ({formatRupiah(totals.total)})</span>
								{/if}
							</button>

							{#if !data.user}
								<p class="text-[11px] text-stone-500 text-center leading-relaxed">
									*Anda akan diarahkan untuk masuk/mendaftar saat tombol diklik. Isian form &amp; keranjang akan disimpan otomatis.
								</p>
							{/if}

							<!-- Trust Statement -->
							<div class="flex items-center justify-center gap-4 pt-2 text-[11px] text-stone-500 text-center">
								<span>🔒 Enkripsi SSL 256-Bit</span>
								<span>•</span>
								<span>Garansi Keaslian 100%</span>
							</div>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>
