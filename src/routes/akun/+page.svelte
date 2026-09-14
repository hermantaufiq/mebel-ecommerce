<script lang="ts">
	import type { PageData } from './$types';
	import { formatRupiah, formatDateId } from '$lib/utils';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';

	import User from '@lucide/svelte/icons/user';
	import Package from '@lucide/svelte/icons/package';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Clock from '@lucide/svelte/icons/clock';
	import Phone from '@lucide/svelte/icons/phone';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Wrench from '@lucide/svelte/icons/wrench';

	let { data }: { data: PageData } = $props();
	let user = $derived(data.user);
	let orders = $derived(data.orders || []);

	let activeTab = $state<'orders' | 'addresses' | 'concierge'>('orders');

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			goto('/login');
		} catch (err) {
			console.error('Logout error:', err);
		}
	}
</script>

<svelte:head>
	<title>Akun Saya &amp; Riwayat Pesanan | Maison Lumina</title>
	<meta name="description" content="Kelola profil, buku alamat, dan pantau riwayat pesanan furnitur Anda di Maison Lumina." />
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<Breadcrumb
				items={[
					{ label: 'Beranda', href: '/' },
					{ label: 'Akun Saya' }
				]}
			/>
		</div>

		<!-- User Profile Header Card -->
		<div class="rounded-3xl border border-[#E8DFD0] bg-white p-6 sm:p-8 shadow-sm">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<!-- Left Profile Info -->
				<div class="flex items-center gap-4">
					<div class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#1F1810] text-[#F7F3EC] font-serif text-2xl font-bold shadow-md shrink-0">
						{user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
					</div>
					<div>
						<div class="flex items-center gap-2.5">
							<h1 class="font-serif text-2xl sm:text-3xl font-bold text-[#1F1810]">
								{user.name}
							</h1>
							<Badge class="bg-amber-100 text-amber-900 border-none px-2.5 py-0.5 text-xs font-semibold">
								<Sparkles class="h-3 w-3 mr-1 text-amber-700 inline" />
								Member {user.tier || 'VIP'}
							</Badge>
						</div>
						<p class="text-xs text-stone-500 mt-1">
							{user.email} • Bergabung sejak {user.createdAt ? new Date(user.createdAt).getFullYear() : 2024}
						</p>
					</div>
				</div>

				<!-- Right Loyalty & Actions -->
				<div class="flex items-center gap-4 border-t border-[#E8DFD0]/60 pt-4 sm:border-0 sm:pt-0">
					<div class="rounded-2xl border border-[#E8DFD0] bg-[#F7F3EC] px-4 py-2.5 text-right">
						<span class="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">
							Poin Loyalitas
						</span>
						<span class="font-serif text-lg font-bold text-[#B5652F]">
							{user.loyaltyPoints?.toLocaleString('id-ID') || 0} Poin
						</span>
					</div>

					<button
						type="button"
						onclick={handleLogout}
						class="flex items-center gap-1.5 rounded-xl border border-[#E8DFD0] bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-600 hover:border-rose-300 hover:text-rose-600 transition-colors shadow-xs"
						title="Keluar dari akun"
					>
						<LogOut class="h-4 w-4" />
						<span class="hidden sm:inline">Keluar</span>
					</button>
				</div>
			</div>

			<!-- Navigation Tabs -->
			<div class="mt-8 flex gap-2 border-t border-[#E8DFD0] pt-4">
				<button
					type="button"
					onclick={() => (activeTab = 'orders')}
					class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all {activeTab === 'orders' ? 'bg-[#1F1810] text-white shadow-sm' : 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Package class="h-4 w-4" />
					<span>Riwayat Pesanan ({orders.length})</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'addresses')}
					class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all {activeTab === 'addresses' ? 'bg-[#1F1810] text-white shadow-sm' : 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<MapPin class="h-4 w-4" />
					<span>Buku Alamat</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'concierge')}
					class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all {activeTab === 'concierge' ? 'bg-[#1F1810] text-white shadow-sm' : 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Phone class="h-4 w-4" />
					<span>Concierge Atelier</span>
				</button>
			</div>
		</div>

		<!-- Tab Contents -->
		<div class="mt-8">
			{#if activeTab === 'orders'}
				<!-- Orders List -->
				{#if orders.length === 0}
					<div class="rounded-3xl border border-[#E8DFD0] bg-white px-6 py-16 text-center shadow-sm">
						<Package class="mx-auto h-12 w-12 text-stone-400" />
						<h2 class="mt-4 font-serif text-xl font-bold text-[#1F1810]">
							Belum Ada Riwayat Pesanan
						</h2>
						<p class="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
							Anda belum memiliki transaksi pesanan di Maison Lumina. Mulai jelajahi karya furnitur terbaik kami.
						</p>
						<a
							href="/produk"
							class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B5652F] transition-colors"
						>
							<span>Mulai Belanja</span>
							<ArrowRight class="h-3.5 w-3.5" />
						</a>
					</div>
				{:else}
					<div class="space-y-6">
						{#each orders as order}
							<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm">
								<!-- Order Header Bar -->
								<div class="flex flex-col gap-3 border-b border-[#E8DFD0] pb-4 sm:flex-row sm:items-center sm:justify-between">
									<div class="flex items-center gap-3">
										<div>
											<span class="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
												Nomor Pesanan
											</span>
											<span class="font-serif text-base font-bold text-[#1F1810]">
												{order.orderNumber}
											</span>
										</div>
										<Badge
											class={
												order.status === 'Selesai'
													? 'bg-emerald-100 text-emerald-800'
													: order.status === 'Dikirim'
													? 'bg-blue-100 text-blue-800'
													: 'bg-amber-100 text-amber-800'
											}
										>
											{order.status}
										</Badge>
									</div>

									<div class="flex items-center gap-4 text-xs text-stone-600">
										<div class="flex items-center gap-1">
											<Clock class="h-3.5 w-3.5 text-stone-400" />
											<span>{order.createdAt ? formatDateId(order.createdAt) : ''}</span>
										</div>
										<span class="font-serif text-base font-bold text-[#1F1810]">
											{formatRupiah(order.total)}
										</span>
									</div>
								</div>

								<!-- Items Preview List -->
								<div class="divide-y divide-[#E8DFD0]/60 py-2">
									{#each order.items as item}
										<div class="flex items-center justify-between py-3">
											<div class="flex items-center gap-3">
												{#if item.product?.images?.[0]?.url}
													<img
														src={item.product.images[0].url}
														alt={item.product.name}
														class="h-12 w-14 rounded-md object-cover border border-[#E8DFD0] bg-[#EDE4D7]"
													/>
												{/if}
												<div>
													<span class="font-serif text-xs font-semibold text-[#1F1810] block">
														{item.product?.name || 'Item Furnitur'}
													</span>
													{#if item.variantLabel}
														<span class="text-[11px] text-[#B5652F] font-medium block">
															Varian: {item.variantLabel}
														</span>
													{/if}
													<span class="text-[11px] text-stone-500">
														{item.qty} unit × {formatRupiah(item.priceAtOrder)}
													</span>
												</div>
											</div>

											<span class="font-serif text-xs font-bold text-[#1F1810]">
												{formatRupiah(item.priceAtOrder * item.qty)}
											</span>
										</div>
									{/each}
								</div>

								<!-- Order Footer & Action -->
								<div class="flex flex-col gap-3 border-t border-[#E8DFD0] pt-4 sm:flex-row sm:items-center sm:justify-between text-xs">
									<div class="text-stone-600">
										<span>Tujuan: <strong>{order.recipientName}</strong>, {order.shippingAddress}</span>
									</div>

									<a
										href="/checkout/konfirmasi?order={order.orderNumber}"
										class="inline-flex items-center gap-1.5 rounded-lg bg-[#1F1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B5652F] transition-colors"
									>
										<span>Lihat E-Invoice &amp; Pelacakan</span>
										<ArrowRight class="h-3.5 w-3.5" />
									</a>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:else if activeTab === 'addresses'}
				<!-- Saved Addresses -->
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-4">
					<h2 class="font-serif text-lg font-semibold text-[#1F1810]">
						Alamat Pengiriman Utama
					</h2>

					<div class="rounded-xl border border-[#E8DFD0] bg-[#F7F3EC]/50 p-5 space-y-2">
						<div class="flex items-center justify-between">
							<span class="font-serif text-sm font-bold text-[#1F1810]">Rumah (Utama)</span>
							<Badge class="bg-[#1F1810] text-white text-[10px]">Default</Badge>
						</div>
						<p class="text-xs font-semibold text-stone-800">
							{user.name} (0812-3456-7890)
						</p>
						<p class="text-xs text-stone-600 leading-relaxed">
							Jl. Kemang Raya No. 45, RT 02 / RW 05, Bangka, Mampang Prapatan, Jakarta Selatan, DKI Jakarta 12730
						</p>
						<div class="pt-2 text-[11px] text-stone-500 italic">
							Catatan: Akses mudah lift barang, konfirmasi 30 menit sebelum pengantaran.
						</div>
					</div>
				</div>
			{:else if activeTab === 'concierge'}
				<!-- Concierge Atelier -->
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#B5652F]/10 text-[#B5652F]">
							<Phone class="h-6 w-6" />
						</div>
						<div>
							<h2 class="font-serif text-xl font-bold text-[#1F1810]">
								Layanan Concierge Eksklusif VIP
							</h2>
							<p class="text-xs text-stone-600">
								Konsultasi langsung dengan tim desainer interior &amp; ahli perakitan mebel kami.
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
						<div class="rounded-xl border border-[#E8DFD0] p-4 bg-[#F7F3EC]/40 space-y-2">
							<ShieldCheck class="h-5 w-5 text-[#B5652F]" />
							<span class="font-bold text-[#1F1810] block">Garansi Rangka 2 Tahun</span>
							<p class="text-stone-600">Perlindungan struktur kayu solid dan konstruksi purus sambungan.</p>
						</div>

						<div class="rounded-xl border border-[#E8DFD0] p-4 bg-[#F7F3EC]/40 space-y-2">
							<Wrench class="h-5 w-5 text-[#B5652F]" />
							<span class="font-bold text-[#1F1810] block">Perawatan &amp; Oiling Kayu</span>
							<p class="text-stone-600">Panduan dan kit perawatan minyak jati alami agar keindahan kayu abadi.</p>
						</div>

						<div class="rounded-xl border border-[#E8DFD0] p-4 bg-[#F7F3EC]/40 space-y-2">
							<Sparkles class="h-5 w-5 text-[#B5652F]" />
							<span class="font-bold text-[#1F1810] block">Custom Dimensi &amp; Kain</span>
							<p class="text-stone-600">Bisa meminta penyesuaian ukuran khusus untuk ruangan Anda.</p>
						</div>
					</div>

					<div class="border-t border-[#E8DFD0] pt-5">
						<a
							href="https://wa.me/6281234567890?text=Halo%20Maison%20Lumina,%20saya%20member%20VIP%20{user.name}%20ingin%20berkonsultasi"
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#B5652F] transition-colors"
						>
							<Phone class="h-4 w-4" />
							<span>Hubungi Konsultan via WhatsApp</span>
							<ArrowRight class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
