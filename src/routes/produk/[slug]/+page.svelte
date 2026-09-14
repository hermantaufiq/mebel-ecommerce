<script lang="ts">
	import { page } from '$app/stores';
	import { products, categories } from '$lib/mockData';
	import type { Product, ProductVariant } from '$lib/types';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { formatRupiah } from '$lib/utils';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import { Badge } from '$lib/components/ui/badge';

	import Star from '@lucide/svelte/icons/star';
	import Heart from '@lucide/svelte/icons/heart';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Check from '@lucide/svelte/icons/check';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Truck from '@lucide/svelte/icons/truck';
	import TreePine from '@lucide/svelte/icons/tree-pine';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Ruler from '@lucide/svelte/icons/ruler';

	// Reactive product retrieval based on current slug
	let product = $derived(products.find((p) => p.slug === $page.params.slug));

	// Active selected image index
	let activeImageIndex = $state(0);

	// Selected variant state
	let selectedVariantId = $state<string | null>(null);

	// Reset / initialize variant when product changes
	$effect(() => {
		if (product && product.variants && product.variants.length > 0) {
			selectedVariantId = product.variants[0].id;
			activeImageIndex = 0;
			qty = 1;
		}
	});

	let selectedVariant = $derived<ProductVariant | undefined>(
		product?.variants?.find((v) => v.id === selectedVariantId) ?? product?.variants?.[0]
	);

	// Price calculation with variant offset
	let effectivePrice = $derived(
		(product?.price ?? 0) + (selectedVariant?.priceOffset ?? 0)
	);

	// Stock of selected variant
	let currentStock = $derived(selectedVariant?.stock ?? 10);

	// Quantity state
	let qty = $state(1);

	function updateQty(delta: number) {
		const next = qty + delta;
		if (next >= 1 && next <= currentStock) {
			qty = next;
		}
	}

	// Feedback state on add to cart
	let addedFeedback = $state(false);

	function handleAddToCart() {
		if (!product) return;
		cartStore.addItem({
			productId: product.id,
			variantId: selectedVariant?.id || null,
			name: product.name,
			image: product.images[activeImageIndex]?.url || product.images[0]?.url || '',
			unitPrice: effectivePrice,
			qty: qty,
			maxStock: currentStock,
			material: product.material,
			variantLabel: selectedVariant?.label || undefined,
			slug: product.slug
		});

		addedFeedback = true;
		setTimeout(() => {
			addedFeedback = false;
		}, 2000);
	}

	// Wishlist check and toggle
	let isWishlisted = $derived(product ? wishlistStore.isWishlisted(product.id) : false);

	function handleToggleWishlist() {
		if (!product) return;
		wishlistStore.toggleWishlist({
			id: product.id,
			productId: product.id,
			name: product.name,
			price: product.price,
			image: product.images[0]?.url || '',
			material: product.material,
			slug: product.slug
		});
	}

	// Related products: same category, excluding current product
	let relatedProducts = $derived(
		product
			? products
					.filter((p) => p.categoryId === product?.categoryId && p.id !== product?.id)
					.slice(0, 4)
			: []
	);

	// Fallback category name if not populated
	let categoryName = $derived(
		product?.categoryName ||
			categories.find((c) => c.id === product?.categoryId)?.name ||
			'Koleksi'
	);

	// Group variants by type if multiple types exist
	let variantTypes = $derived(() => {
		if (!product?.variants) return {};
		const groups: Record<string, ProductVariant[]> = {};
		for (const v of product.variants) {
			const typeKey = v.type || 'Pilihan';
			if (!groups[typeKey]) groups[typeKey] = [];
			groups[typeKey].push(v);
		}
		return groups;
	});

	function getVariantGroupTitle(type: string): string {
		switch (type) {
			case 'warna_kain':
				return 'Warna Kain';
			case 'material_kayu':
				return 'Finishing Kayu';
			case 'ukuran':
				return 'Ukuran';
			default:
				return 'Varian';
		}
	}
</script>

<svelte:head>
	<title>{product ? `${product.name} | Maison Lumina` : 'Produk Tidak Ditemukan | Maison Lumina'}</title>
	{#if product}
		<meta name="description" content={product.description} />
	{/if}
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		{#if !product}
			<!-- 404 Empty State -->
			<div class="py-20 text-center">
				<h1 class="font-serif text-3xl font-bold text-[#1F1810]">Produk Tidak Ditemukan</h1>
				<p class="mt-3 text-stone-600">Produk yang Anda cari mungkin telah dipindahkan atau sudah tidak tersedia.</p>
				<a
					href="/produk"
					class="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1F1810] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#B5652F]"
				>
					<ArrowLeft class="h-4 w-4" />
					Kembali ke Katalog Produk
				</a>
			</div>
		{:else}
			<!-- Breadcrumb -->
			<div class="mb-6">
				<Breadcrumb
					items={[
						{ label: 'Beranda', href: '/' },
						{ label: 'Katalog', href: '/produk' },
						{ label: categoryName, href: `/produk?kategori=${product.categoryId}` },
						{ label: product.name }
					]}
				/>
			</div>

			<!-- Main Product Details Grid -->
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
				<!-- Left Column: Gallery (7 cols on lg) -->
				<div class="lg:col-span-7">
					<div class="space-y-4">
						<!-- Main Preview Image -->
						<div class="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EDE4D7] shadow-sm border border-[#E8DFD0]/60">
							<img
								src={product.images[activeImageIndex]?.url || product.images[0]?.url}
								alt={product.images[activeImageIndex]?.altText || product.name}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>

							<!-- Status Badge -->
							{#if product.status}
								<div class="absolute top-4 left-4 z-10">
									<Badge
										class={
											product.status === 'Bestseller'
												? 'bg-[#B5652F] text-white border-none'
												: product.status === 'Ready Stock'
												? 'bg-emerald-700 text-white border-none'
												: 'bg-[#1F1810] text-[#F7F3EC] border-none'
										}
									>
										{product.status}
									</Badge>
								</div>
							{/if}

							<!-- Wishlist Floating Button -->
							<button
								type="button"
								onclick={handleToggleWishlist}
								class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
								aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
							>
								<Heart
									class="h-5 w-5 transition-colors {isWishlisted ? 'fill-[#A33A3A] text-[#A33A3A]' : 'text-stone-600'}"
								/>
							</button>
						</div>

						<!-- Thumbnails -->
						{#if product.images && product.images.length > 1}
							<div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
								{#each product.images as img, i}
									<button
										type="button"
										onclick={() => (activeImageIndex = i)}
										class="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all {activeImageIndex === i ? 'border-[#B5652F] ring-2 ring-[#B5652F]/20' : 'border-transparent opacity-75 hover:opacity-100'}"
									>
										<img
											src={img.url}
											alt={img.altText || `${product.name} foto ${i + 1}`}
											class="h-full w-full object-cover"
										/>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Highlights & Dimensions -->
					<div class="mt-10 rounded-2xl bg-white/60 p-6 backdrop-blur-sm border border-[#E8DFD0]/60 space-y-6">
						<h3 class="font-serif text-lg font-semibold text-[#1F1810] flex items-center gap-2">
							<Ruler class="h-5 w-5 text-[#B5652F]" />
							Dimensi & Rincian Produk
						</h3>

						{#if product.dimensions}
							<div class="grid grid-cols-3 gap-4 border-y border-[#E8DFD0] py-4 text-center">
								<div>
									<span class="block text-xs uppercase tracking-wider text-stone-500 font-medium">Panjang</span>
									<span class="text-base font-semibold text-[#1F1810]">{product.dimensions.panjang} cm</span>
								</div>
								<div class="border-x border-[#E8DFD0]">
									<span class="block text-xs uppercase tracking-wider text-stone-500 font-medium">Lebar</span>
									<span class="text-base font-semibold text-[#1F1810]">{product.dimensions.lebar} cm</span>
								</div>
								<div>
									<span class="block text-xs uppercase tracking-wider text-stone-500 font-medium">Tinggi</span>
									<span class="text-base font-semibold text-[#1F1810]">{product.dimensions.tinggi} cm</span>
								</div>
							</div>
						{/if}

						{#if product.attributes}
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-stone-700">
								{#if product.attributes.fabricType}
									<div class="flex justify-between py-1 border-b border-[#E8DFD0]/40">
										<span class="text-stone-500">Bahan Kain</span>
										<span class="font-medium text-[#1F1810]">{product.attributes.fabricType}</span>
									</div>
								{/if}
								{#if product.attributes.frameConstruction}
									<div class="flex justify-between py-1 border-b border-[#E8DFD0]/40">
										<span class="text-stone-500">Konstruksi</span>
										<span class="font-medium text-[#1F1810]">{product.attributes.frameConstruction}</span>
									</div>
								{/if}
								{#if product.attributes.cushionDensity}
									<div class="flex justify-between py-1 border-b border-[#E8DFD0]/40">
										<span class="text-stone-500">Kepadatan Busa</span>
										<span class="font-medium text-[#1F1810]">{product.attributes.cushionDensity}</span>
									</div>
								{/if}
								{#if product.attributes.seatHeight}
									<div class="flex justify-between py-1 border-b border-[#E8DFD0]/40">
										<span class="text-stone-500">Tinggi Dudukan</span>
										<span class="font-medium text-[#1F1810]">{product.attributes.seatHeight}</span>
									</div>
								{/if}
								{#if product.attributes.finish}
									<div class="flex justify-between py-1 border-b border-[#E8DFD0]/40">
										<span class="text-stone-500">Finishing</span>
										<span class="font-medium text-[#1F1810]">{product.attributes.finish}</span>
									</div>
								{/if}
								{#if product.attributes.woodOrigin}
									<div class="flex justify-between py-1 border-b border-[#E8DFD0]/40">
										<span class="text-stone-500">Asal Kayu</span>
										<span class="font-medium text-[#1F1810]">{product.attributes.woodOrigin}</span>
									</div>
								{/if}
							</div>
						{/if}

						<div>
							<h4 class="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">Deskripsi Produk</h4>
							<p class="text-stone-700 leading-relaxed text-sm">
								{product.description}
							</p>
						</div>
					</div>
				</div>

				<!-- Right Column: Product Information & Purchase (5 cols on lg) -->
				<div class="lg:col-span-5 space-y-6">
					<div>
						<!-- Category & Rating -->
						<div class="flex items-center justify-between gap-2">
							<span class="text-xs font-semibold uppercase tracking-wider text-[#B5652F]">
								{categoryName}
							</span>
							<div class="flex items-center gap-1.5 text-xs text-stone-600">
								<div class="flex items-center text-amber-500">
									<Star class="h-4 w-4 fill-amber-500" />
								</div>
								<span class="font-semibold text-[#1F1810]">{product.rating}</span>
								<span>({product.reviewCount} ulasan)</span>
							</div>
						</div>

						<!-- Product Title -->
						<h1 class="mt-2 font-serif text-2xl font-bold text-[#1F1810] sm:text-3xl lg:text-4xl">
							{product.name}
						</h1>

						<!-- Material subtitle -->
						<p class="mt-1 text-sm text-stone-600">
							Material: <span class="font-medium text-[#1F1810]">{product.material}</span>
						</p>

						<!-- Dynamic Price Display -->
						<div class="mt-4 flex items-baseline gap-3">
							<span class="font-serif text-3xl font-bold text-[#1F1810]">
								{formatRupiah(effectivePrice)}
							</span>
							{#if selectedVariant && selectedVariant.priceOffset !== 0}
								<span class="text-xs text-[#B5652F] font-medium">
									({selectedVariant.priceOffset > 0 ? '+' : ''}{formatRupiah(selectedVariant.priceOffset)})
								</span>
							{/if}
						</div>

						{#if product.statusDetail}
							<p class="mt-1 text-xs text-stone-500 italic">
								{product.statusDetail}
							</p>
						{/if}
					</div>

					<hr class="border-[#E8DFD0]" />

					<!-- Variant Selector -->
					{#if product.variants && product.variants.length > 0}
						{@const groups = variantTypes()}
						<div class="space-y-5">
							{#each Object.entries(groups) as [type, variantsList]}
								<div>
									<div class="flex justify-between items-center mb-2">
										<span class="text-sm font-semibold text-[#1F1810]">
											{getVariantGroupTitle(type)}
										</span>
										{#if selectedVariant && selectedVariant.type === type}
											<span class="text-xs text-stone-500 font-medium">
												{selectedVariant.label}
											</span>
										{/if}
									</div>

									<div class="flex flex-wrap gap-2.5">
										{#each variantsList as v}
											{#if v.hexOrSwatch}
												<!-- Swatch button with color circle -->
												<button
													type="button"
													onclick={() => {
														selectedVariantId = v.id;
														if (qty > v.stock) qty = Math.max(1, v.stock);
													}}
													class="group relative flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all {selectedVariantId === v.id ? 'border-[#1F1810] bg-[#1F1810] text-white shadow-sm' : 'border-[#E8DFD0] bg-white text-stone-700 hover:border-stone-400'}"
												>
													<span
														class="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
														style="background-color: {v.hexOrSwatch};"
													></span>
													<span>{v.label}</span>
												</button>
											{:else}
												<!-- Standard Pill Button -->
												<button
													type="button"
													onclick={() => {
														selectedVariantId = v.id;
														if (qty > v.stock) qty = Math.max(1, v.stock);
													}}
													class="rounded-lg border px-4 py-2 text-xs font-medium transition-all {selectedVariantId === v.id ? 'border-[#1F1810] bg-[#1F1810] text-white shadow-sm' : 'border-[#E8DFD0] bg-white text-stone-700 hover:border-stone-400'}"
												>
													<span>{v.label}</span>
													{#if v.priceOffset !== 0}
														<span class="ml-1 text-[11px] {selectedVariantId === v.id ? 'text-stone-300' : 'text-[#B5652F]'}">
															({v.priceOffset > 0 ? '+' : ''}{formatRupiah(v.priceOffset)})
														</span>
													{/if}
												</button>
											{/if}
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Stock Status Indicator -->
					<div class="flex items-center gap-2 text-xs">
						{#if currentStock > 5}
							<span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
							<span class="text-emerald-700 font-medium">Stok tersedia ({currentStock} unit)</span>
						{:else if currentStock > 0}
							<span class="flex h-2 w-2 rounded-full bg-amber-500"></span>
							<span class="text-amber-700 font-medium">Stok terbatas — sisa {currentStock} unit!</span>
						{:else}
							<span class="flex h-2 w-2 rounded-full bg-rose-500"></span>
							<span class="text-rose-700 font-medium">Stok habis</span>
						{/if}
					</div>

					<!-- Quantity Selector & Add to Cart -->
					<div class="space-y-3 pt-2">
						<div class="flex items-center gap-4">
							<div class="flex items-center rounded-lg border border-[#E8DFD0] bg-white">
								<button
									type="button"
									onclick={() => updateQty(-1)}
									disabled={qty <= 1}
									class="flex h-11 w-11 items-center justify-center text-stone-600 transition-colors hover:text-[#1F1810] disabled:opacity-40"
									aria-label="Kurangi kuantitas"
								>
									<Minus class="h-4 w-4" />
								</button>
								<span class="w-12 text-center text-sm font-semibold text-[#1F1810]">
									{qty}
								</span>
								<button
									type="button"
									onclick={() => updateQty(1)}
									disabled={qty >= currentStock}
									class="flex h-11 w-11 items-center justify-center text-stone-600 transition-colors hover:text-[#1F1810] disabled:opacity-40"
									aria-label="Tambah kuantitas"
								>
									<Plus class="h-4 w-4" />
								</button>
							</div>

							<!-- Add to Cart Primary Button -->
							<button
								type="button"
								onclick={handleAddToCart}
								disabled={currentStock <= 0}
								class="flex flex-1 items-center justify-center gap-2.5 rounded-lg bg-[#B5652F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9E5424] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if addedFeedback}
									<Check class="h-5 w-5 text-white animate-bounce" />
									<span>Berhasil Ditambahkan!</span>
								{:else}
									<ShoppingBag class="h-5 w-5" />
									<span>Tambah ke Keranjang</span>
								{/if}
							</button>
						</div>

						<!-- Wishlist Secondary Full Button -->
						<button
							type="button"
							onclick={handleToggleWishlist}
							class="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1F1810] bg-transparent py-2.5 text-xs font-semibold text-[#1F1810] transition-colors hover:bg-[#1F1810] hover:text-white"
						>
							<Heart
								class="h-4 w-4 {isWishlisted ? 'fill-[#A33A3A] text-[#A33A3A]' : ''}"
							/>
							<span>{isWishlisted ? 'Tersimpan di Wishlist' : 'Simpan ke Wishlist'}</span>
						</button>
					</div>

					<hr class="border-[#E8DFD0]" />

					<!-- Trust Badges & Guarantee -->
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 text-xs text-stone-600">
						<div class="flex items-center gap-2 rounded-lg bg-white/50 p-3 border border-[#E8DFD0]/50">
							<Truck class="h-5 w-5 text-[#B5652F] shrink-0" />
							<span>Gratis Ongkir Jabodetabek</span>
						</div>
						<div class="flex items-center gap-2 rounded-lg bg-white/50 p-3 border border-[#E8DFD0]/50">
							<ShieldCheck class="h-5 w-5 text-[#B5652F] shrink-0" />
							<span>Garansi Konstruksi 2 Tahun</span>
						</div>
						<div class="flex items-center gap-2 rounded-lg bg-white/50 p-3 border border-[#E8DFD0]/50">
							<TreePine class="h-5 w-5 text-[#B5652F] shrink-0" />
							<span>100% Kayu Solid Berkelanjutan</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Bottom Recommendations Section -->
			{#if relatedProducts.length > 0}
				<div class="mt-20 border-t border-[#E8DFD0] pt-12">
					<div class="mb-8 flex items-end justify-between">
						<div>
							<h2 class="font-serif text-2xl font-bold text-[#1F1810] sm:text-3xl">
								Anda Mungkin Juga Suka
							</h2>
							<p class="mt-1 text-sm text-stone-600">
								Produk pilihan dari koleksi {categoryName} yang melengkapi ruangan Anda.
							</p>
						</div>
						<a
							href="/produk?kategori={product.categoryId}"
							class="text-xs font-semibold uppercase tracking-wider text-[#B5652F] hover:underline hidden sm:block"
						>
							Lihat Semua &rarr;
						</a>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{#each relatedProducts as related}
							<ProductCard product={related} />
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
