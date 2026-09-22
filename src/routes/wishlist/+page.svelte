<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import type { WishlistItem } from '$lib/types';
	import { formatRupiah } from '$lib/utils';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import { Badge } from '$lib/components/ui/badge';

	import Heart from '@lucide/svelte/icons/heart';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Check from '@lucide/svelte/icons/check';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		if (data.dbWishlistItems && data.dbWishlistItems.length > 0) {
			wishlistStore.syncFromDatabase(data.dbWishlistItems);
		}
	});

	// Filter & Sort State
	let selectedCategory = $state('Semua');
	let sortBy = $state<'terbaru' | 'harga-asc' | 'harga-desc' | 'nama'>('terbaru');

	// Feedback states
	let addedItemIds = $state<Record<string, boolean>>({});
	let movedAllFeedback = $state(false);

	// Dynamic Category list with count based on current wishlist items
	let categoriesWithCount = $derived.by(() => {
		const counts: Record<string, number> = { Semua: wishlistStore.items.length };
		for (const item of wishlistStore.items) {
			const cat = item.category || 'Lainnya';
			counts[cat] = (counts[cat] || 0) + 1;
		}
		return Object.entries(counts).map(([name, count]) => ({ name, count }));
	});

	// Filtered & Sorted Wishlist Items
	let displayedItems = $derived.by(() => {
		let list = [...wishlistStore.items];

		// Category filter
		if (selectedCategory !== 'Semua') {
			list = list.filter((item) => (item.category || 'Lainnya') === selectedCategory);
		}

		// Sorting
		if (sortBy === 'harga-asc') {
			list.sort((a, b) => a.price - b.price);
		} else if (sortBy === 'harga-desc') {
			list.sort((a, b) => b.price - a.price);
		} else if (sortBy === 'nama') {
			list.sort((a, b) => a.name.localeCompare(b.name));
		}
		// 'terbaru' keeps the natural order (reversed or order inserted)
		return list;
	});

	function handleAddToCart(item: WishlistItem) {
		cartStore.addItem({
			productId: item.productId,
			variantId: null,
			name: item.name,
			image: item.image,
			unitPrice: item.price,
			qty: 1,
			maxStock: 20,
			material: item.material,
			slug: item.slug
		});

		addedItemIds[item.productId] = true;
		setTimeout(() => {
			addedItemIds[item.productId] = false;
		}, 1800);
	}

	function handleMoveAllToCart() {
		if (wishlistStore.items.length === 0) return;

		const cartPayloads = wishlistStore.items.map((item) => ({
			productId: item.productId,
			variantId: null,
			name: item.name,
			image: item.image,
			unitPrice: item.price,
			qty: 1,
			maxStock: 20,
			material: item.material,
			slug: item.slug
		}));

		cartStore.addMultipleItems(cartPayloads);
		movedAllFeedback = true;
		setTimeout(() => {
			movedAllFeedback = false;
		}, 3000);
	}

	// Curated recommendations from Prisma DB (excluding items already in wishlist)
	let recommendationProducts = $derived(
		(data.recommendations || [])
			.filter((p: any) => !wishlistStore.isWishlisted(p.id))
			.slice(0, 4)
	);
</script>

<svelte:head>
	<title>Daftar Keinginan | Maison Lumina</title>
	<meta name="description" content="Koleksi furnitur dan mebel pilihan yang Anda simpan di Maison Lumina." />
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<Breadcrumb
				items={[
					{ label: 'Beranda', href: '/' },
					{ label: 'Daftar Keinginan' }
				]}
			/>
		</div>

		<!-- Page Header & Bulk Action -->
		<div class="mb-8 flex flex-col gap-4 border-b border-[#E8DFD0] pb-6 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<div class="flex items-center gap-2">
					<h1 class="font-serif text-3xl font-bold text-[#1F1810] sm:text-4xl">
						Daftar Keinginan
					</h1>
					{#if wishlistStore.itemCount > 0}
						<Badge class="bg-[#B5652F] text-white border-none px-2.5 py-0.5 text-xs">
							{wishlistStore.itemCount} Item
						</Badge>
					{/if}
				</div>
				<p class="mt-2 text-sm text-stone-600">
					Kurasi personal furnitur impian Anda untuk hunian yang hangat dan berkarakter.
				</p>
			</div>

			{#if wishlistStore.itemCount > 0}
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={handleMoveAllToCart}
						class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F1810] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#B5652F] active:scale-95"
					>
						{#if movedAllFeedback}
							<Check class="h-4 w-4 text-emerald-400" />
							<span>Semua Ditambahkan!</span>
						{:else}
							<ShoppingBag class="h-4 w-4" />
							<span>Pindahkan Semua ke Keranjang</span>
						{/if}
					</button>

					<button
						type="button"
						onclick={() => wishlistStore.clearWishlist()}
						class="inline-flex items-center justify-center rounded-lg border border-[#E8DFD0] bg-white px-3 py-2.5 text-xs font-medium text-stone-600 transition-colors hover:border-rose-300 hover:text-rose-600"
						title="Kosongkan seluruh daftar keinginan"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			{/if}
		</div>

		{#if wishlistStore.itemCount === 0}
			<!-- Luxury Empty State -->
			<div class="rounded-3xl border border-[#E8DFD0] bg-white/70 px-6 py-20 text-center backdrop-blur-sm shadow-sm">
				<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE4D7] text-[#B5652F]">
					<Heart class="h-10 w-10 text-[#B5652F]" />
				</div>
				<h2 class="mt-6 font-serif text-2xl font-bold text-[#1F1810]">
					Daftar Keinginan Anda Masih Kosong
				</h2>
				<p class="mx-auto mt-2 max-w-md text-sm text-stone-600 leading-relaxed">
					Jelajahi koleksi furnitur berkualitas tinggi kami dan simpan desain favorit Anda dengan menekan ikon hati.
				</p>
				<div class="mt-8">
					<a
						href="/produk"
						class="inline-flex items-center gap-2 rounded-lg bg-[#1F1810] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#B5652F] hover:shadow-md"
					>
						<span>Jelajahi Koleksi Furnitur</span>
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		{:else}
			<!-- Filter & Sorting Bar -->
			<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- Category Chips -->
				<div class="flex flex-wrap items-center gap-2">
					{#each categoriesWithCount as cat}
						<button
							type="button"
							onclick={() => (selectedCategory = cat.name)}
							class="rounded-full px-4 py-1.5 text-xs font-medium transition-all {selectedCategory === cat.name ? 'bg-[#1F1810] text-white shadow-sm' : 'bg-white border border-[#E8DFD0] text-stone-600 hover:border-stone-400'}"
						>
							{cat.name} ({cat.count})
						</button>
					{/each}
				</div>

				<!-- Sort Dropdown -->
				<div class="flex items-center gap-2">
					<label for="sort-select" class="flex items-center gap-1.5 text-xs font-medium text-stone-600">
						<ArrowUpDown class="h-3.5 w-3.5" />
						<span>Urutkan:</span>
					</label>
					<select
						id="sort-select"
						bind:value={sortBy}
						class="rounded-lg border border-[#E8DFD0] bg-white px-3 py-1.5 text-xs font-medium text-[#1F1810] shadow-sm focus:border-[#B5652F] focus:outline-none"
					>
						<option value="terbaru">Terbaru Ditambahkan</option>
						<option value="harga-asc">Harga Terendah</option>
						<option value="harga-desc">Harga Tertinggi</option>
						<option value="nama">Nama Produk A-Z</option>
					</select>
				</div>
			</div>

			<!-- Wishlist Grid -->
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each displayedItems as item (item.productId)}
					<div class="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E8DFD0] bg-white shadow-sm transition-all hover:shadow-md">
						<!-- Image Container -->
						<a
							href="/produk/{item.slug}"
							class="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE4D7]"
						>
							<img
								src={item.image}
								alt={item.name}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>

							<!-- Category & Status Badge -->
							{#if item.category}
								<span class="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-700 backdrop-blur-xs">
									{item.category}
								</span>
							{/if}
						</a>

						<!-- Remove Button -->
						<button
							type="button"
							onclick={() => wishlistStore.removeItem(item.productId)}
							class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow-sm backdrop-blur-xs transition-colors hover:bg-rose-50 hover:text-rose-600"
							aria-label="Hapus dari wishlist"
						>
							<Trash2 class="h-4 w-4" />
						</button>

						<!-- Info Body -->
						<div class="flex flex-1 flex-col p-5">
							<a
								href="/produk/{item.slug}"
								class="font-serif text-base font-semibold text-[#1F1810] transition-colors hover:text-[#B5652F]"
							>
								{item.name}
							</a>

							{#if item.material}
								<p class="mt-1 text-xs text-stone-500">
									{item.material}
								</p>
							{/if}

							<div class="mt-3 flex items-baseline justify-between pt-2 border-t border-[#E8DFD0]/60">
								<span class="font-serif text-base font-bold text-[#1F1810]">
									{formatRupiah(item.price)}
								</span>
							</div>

							<!-- Action: Add to Cart -->
							<div class="mt-4 pt-2">
								<button
									type="button"
									onclick={() => handleAddToCart(item)}
									class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B5652F] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#9E5424] active:scale-95"
								>
									{#if addedItemIds[item.productId]}
										<Check class="h-4 w-4 text-white animate-bounce" />
										<span>Ditambahkan!</span>
									{:else}
										<ShoppingBag class="h-4 w-4" />
										<span>+ Keranjang</span>
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Curated Recommendations Section -->
		{#if recommendationProducts.length > 0}
			<div class="mt-20 border-t border-[#E8DFD0] pt-12">
				<div class="mb-8 flex items-end justify-between">
					<div>
						<div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B5652F]">
							<Sparkles class="h-4 w-4" />
							<span>Inspirasi Hunian</span>
						</div>
						<h2 class="mt-1 font-serif text-2xl font-bold text-[#1F1810] sm:text-3xl">
							Rekomendasi Pilihan Untuk Anda
						</h2>
						<p class="mt-1 text-sm text-stone-600">
							Koleksi mebel bernilai seni tinggi yang cocok melengkapi ruang favorit Anda.
						</p>
					</div>

					<a
						href="/produk"
						class="hidden text-xs font-semibold uppercase tracking-wider text-[#B5652F] hover:underline sm:block"
					>
						Lihat Semua &rarr;
					</a>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{#each recommendationProducts as recProduct}
						<ProductCard product={recProduct} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
