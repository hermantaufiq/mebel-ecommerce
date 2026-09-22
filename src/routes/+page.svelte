<script lang="ts">
	import type { PageData } from './$types';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { formatRupiah } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Badge } from '$lib/components/ui/badge';

	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Heart from '@lucide/svelte/icons/heart';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Star from '@lucide/svelte/icons/star';
	import Check from '@lucide/svelte/icons/check';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Compass from '@lucide/svelte/icons/compass';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Hammer from '@lucide/svelte/icons/hammer';

	let { data }: { data: PageData } = $props();

	// Featured products from server (Prisma DB)
	let featuredProducts = $derived(data.featuredProducts);

	let addedFeedbackId = $state<string | null>(null);

	type FeaturedProduct = (typeof featuredProducts)[number];

	function handleAddToCart(product: FeaturedProduct) {
		cartStore.addItem({
			productId: product.id,
			variantId: product.variants?.[0]?.id || null,
			name: product.name,
			image: product.images[0]?.url || '',
			unitPrice: product.price,
			qty: 1,
			maxStock: product.variants?.[0]?.stock ?? 20,
			material: product.material,
			variantLabel: product.variants?.[0]?.label || undefined,
			slug: product.slug
		});

		addedFeedbackId = product.id;
		setTimeout(() => {
			if (addedFeedbackId === product.id) {
				addedFeedbackId = null;
			}
		}, 1500);
	}

	function handleToggleWishlist(product: FeaturedProduct) {
		wishlistStore.toggleWishlist({
			id: product.id,
			productId: product.id,
			name: product.name,
			slug: product.slug,
			image: product.images[0]?.url || '',
			price: product.price,
			material: product.material,
			category: product.category?.name
		});
	}
</script>

<!-- Hero Section -->
<section class="relative bg-gradient-to-b from-stone-warm via-sand-light/40 to-stone-warm py-16 sm:py-24 border-b border-border/60 overflow-hidden">
	<!-- Subtle ambient decoration -->
	<div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sand/30 blur-3xl pointer-events-none"></div>
	<div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-terracotta/5 blur-3xl pointer-events-none"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
			<!-- Hero Text -->
			<div class="lg:col-span-7 space-y-6 text-left">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand border border-border text-xs font-semibold tracking-wider text-espresso uppercase">
					<Sparkles class="w-3.5 h-3.5 text-terracotta" />
					<span>Koleksi Musim 2026 / 2027</span>
				</div>

				<h1 class="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-espresso tracking-tight leading-[1.15]">
					Harmoni Alam &amp; <span class="italic font-normal text-terracotta">Ketelitian Arsitektural</span> dalam Hunian Anda
				</h1>

				<p class="text-sm sm:text-base text-muted-foreground max-w-2xl font-light leading-relaxed">
					Setiap lekuk kayu jati solid, sambungan purus tradisional, dan tenun tekstil alami kami hadirkan untuk menciptakan ruang tinggal yang tenang, hangat, dan berkarakter abadi.
				</p>

				<div class="flex flex-wrap items-center gap-4 pt-2">
					<Button
						href="/produk"
						class="bg-espresso hover:bg-espresso/90 text-stone-warm px-6 py-6 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-md shadow-md hover:shadow-lg transition-all group"
					>
						<span>Jelajahi Katalog</span>
						<ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>

					<Button
						href="/room-planner"
						variant="outline"
						class="border-border bg-white hover:bg-sand/40 text-espresso px-5 py-6 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-md transition-colors flex items-center gap-2"
					>
						<Compass class="w-4 h-4 text-terracotta" />
						<span>3D Room Planner</span>
					</Button>
				</div>

				<!-- Quick Highlights -->
				<div class="grid grid-cols-3 gap-4 pt-6 border-t border-border/80 max-w-lg">
					<div>
						<span class="font-serif text-xl sm:text-2xl font-bold text-espresso block">100%</span>
						<span class="text-[11px] text-muted-foreground uppercase tracking-wide">Kayu Jati Solid</span>
					</div>
					<div>
						<span class="font-serif text-xl sm:text-2xl font-bold text-espresso block">5 Tahun</span>
						<span class="text-[11px] text-muted-foreground uppercase tracking-wide">Garansi Struktur</span>
					</div>
					<div>
						<span class="font-serif text-xl sm:text-2xl font-bold text-espresso block">0 IDR</span>
						<span class="text-[11px] text-muted-foreground uppercase tracking-wide">Kirim Jabodetabek</span>
					</div>
				</div>
			</div>

			<!-- Hero Image Showcase -->
			<div class="lg:col-span-5 relative">
				<div class="relative rounded-2xl overflow-hidden border border-border shadow-2xl aspect-[4/5] bg-sand/30">
					<img
						src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
						alt="Maison Lumina living room curation"
						class="w-full h-full object-cover"
						loading="eager"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent"></div>

					<!-- Floating Product Card in Hero -->
					<div class="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-border shadow-lg">
						<div class="flex items-center justify-between">
							<div>
								<span class="text-[10px] tracking-widest font-semibold uppercase text-terracotta block">
									Sorotan Desain
								</span>
								<h3 class="font-serif font-semibold text-sm text-espresso">
									Sofa 3-Seater Aruna Jati
								</h3>
								<span class="text-xs font-semibold text-espresso/80">
									{formatRupiah(18500000)}
								</span>
							</div>
							<Button
								href="/produk/sofa-3-seater-aruna-jati"
								size="sm"
								class="bg-terracotta hover:bg-terracotta-hover text-white text-xs px-3"
							>
								Lihat Detail
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Curated Rooms Category Section -->
<section class="py-16 sm:py-20 border-b border-border/60 bg-white/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-12">
			<span class="text-xs font-semibold tracking-widest text-terracotta uppercase block mb-2">
				Kurasi Ruang
			</span>
			<h2 class="font-serif text-2xl sm:text-4xl font-semibold text-espresso">
				Tata Setiap Sudut dengan Proporsi Sempurna
			</h2>
			<p class="text-xs sm:text-sm text-muted-foreground mt-2">
				Temukan inspirasi furnitur modular dan arsitektural yang dirancang khusus untuk kenyamanan setiap aktivitas.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each [
				{ name: 'Ruang Tamu', slug: 'ruang-tamu', count: '14 Koleksi', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
				{ name: 'Kamar Tidur', slug: 'kamar-tidur', count: '10 Koleksi', img: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=600&q=80' },
				{ name: 'Ruang Makan', slug: 'ruang-makan', count: '12 Koleksi', img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80' },
				{ name: 'Ruang Kerja', slug: 'ruang-kerja', count: '8 Koleksi', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80' }
			] as cat}
				<a
					href={`/produk?kategori=${cat.slug}`}
					class="group relative rounded-xl overflow-hidden aspect-[3/4] border border-border shadow-sm hover:shadow-xl transition-all"
				>
					<img
						src={cat.img}
						alt={cat.name}
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						loading="lazy"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent"></div>
					<div class="absolute bottom-5 left-5 right-5 text-white">
						<span class="text-[10px] tracking-widest text-sand/80 uppercase block">{cat.count}</span>
						<h3 class="font-serif text-lg font-semibold group-hover:text-sand transition-colors">{cat.name}</h3>
						<div class="flex items-center gap-1 text-xs text-sand font-medium mt-1 group-hover:translate-x-1 transition-transform">
							<span>Jelajahi</span>
							<ArrowRight class="w-3 h-3" />
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Featured Products Showcase (Verifies cart & wishlist stores) -->
<section class="py-16 sm:py-24 border-b border-border/60">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
			<div>
				<span class="text-xs font-semibold tracking-widest text-terracotta uppercase block mb-2">
					Karya Unggulan
				</span>
				<h2 class="font-serif text-2xl sm:text-4xl font-semibold text-espresso">
					Koleksi Terpopuler Atelier
				</h2>
			</div>
			<Button
				href="/produk"
				variant="outline"
				class="border-border text-xs font-semibold tracking-wider uppercase hover:bg-sand/40 flex items-center gap-1.5"
			>
				<span>Lihat Semua Koleksi</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</Button>
		</div>

		<!-- Products Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each featuredProducts as product}
				<div class="group bg-white rounded-xl border border-border/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
					<!-- Product Image & Badges -->
					<div class="relative aspect-square overflow-hidden bg-sand/20">
						<img
							src={product.images[0]?.url}
							alt={product.name}
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							loading="lazy"
						/>

						<!-- Status Badge -->
						<div class="absolute top-3 left-3">
							<Badge class="bg-espresso/90 text-stone-warm text-[10px] font-medium tracking-wide backdrop-blur-sm">
								{product.status}
							</Badge>
						</div>

						<!-- Wishlist Button -->
						<button
							onclick={() => handleToggleWishlist(product)}
							class="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-sm text-espresso hover:text-terracotta hover:bg-white transition-colors"
							aria-label="Simpan ke wishlist"
						>
							<Heart
								class={`w-4 h-4 transition-colors ${
									wishlistStore.isWishlisted(product.id) ? 'fill-terracotta text-terracotta' : ''
								}`}
							/>
						</button>
					</div>

					<!-- Product Information -->
					<div class="p-4 flex-1 flex flex-col justify-between space-y-3">
						<div>
							<div class="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
								<span>{product.category?.name || 'Mebel'}</span>
								<div class="flex items-center gap-1 text-amber-600 font-medium">
									<Star class="w-3 h-3 fill-amber-500 text-amber-500" />
									<span>{product.rating}</span>
								</div>
							</div>

							<a href={`/produk/${product.slug}`} class="block group-hover:text-terracotta transition-colors">
								<h3 class="font-serif font-semibold text-sm sm:text-base text-espresso line-clamp-1">
									{product.name}
								</h3>
							</a>

							<p class="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
								{product.material}
							</p>
						</div>

						<div class="pt-2 border-t border-border/60 flex items-center justify-between">
							<span class="font-semibold text-sm sm:text-base text-espresso">
								{formatRupiah(product.price)}
							</span>

							<Button
								size="sm"
								onclick={() => handleAddToCart(product)}
								class={`h-8 px-3 text-xs font-medium rounded transition-colors ${
									addedFeedbackId === product.id
										? 'bg-emerald-600 hover:bg-emerald-700 text-white'
										: 'bg-espresso hover:bg-terracotta text-white'
								}`}
							>
								{#if addedFeedbackId === product.id}
									<Check class="w-3.5 h-3.5 mr-1" />
									<span>Masuk</span>
								{:else}
									<ShoppingBag class="w-3.5 h-3.5 mr-1" />
									<span>+ Cart</span>
								{/if}
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Craftsmanship & Atelier Banner -->
<section class="py-16 sm:py-20 bg-espresso text-stone-warm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<span class="text-xs font-semibold tracking-widest text-terracotta uppercase block">
					Keunggulan Kriya
				</span>
				<h2 class="font-serif text-3xl sm:text-4xl font-semibold text-white leading-snug">
					Kombinasi Seni Purus &amp; Pengeringan Kayu Oven Tingkat Presisi
				</h2>
				<p class="text-sm text-sand/80 font-light leading-relaxed">
					Kami menolak jalan pintas. Setiap balok kayu jati solid dikeringkan dengan moisture content ideal di bawah 12% untuk mencegah retak cuaca tropis, dipahat dengan sambungan purus mortise-and-tenon tanpa paku kasar, dan diampelas halus hingga menghasilkan sentuhan alami layaknya sutra.
				</p>

				<div class="grid grid-cols-2 gap-4 pt-2">
					<div class="flex items-center gap-3">
						<Hammer class="w-5 h-5 text-terracotta shrink-0" />
						<span class="text-xs sm:text-sm text-white font-medium">Pengrajin Jepara Generasi ke-3</span>
					</div>
					<div class="flex items-center gap-3">
						<ShieldCheck class="w-5 h-5 text-terracotta shrink-0" />
						<span class="text-xs sm:text-sm text-white font-medium">Finishing Non-Toxic Waterbased</span>
					</div>
				</div>

				<div class="pt-2">
					<Button
						href="/craftsmanship"
						class="bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm uppercase tracking-wider font-semibold px-6 py-5 rounded-md"
					>
						Pelajari Standar Craftsmanship Kami
					</Button>
				</div>
			</div>

			<div class="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-black/40">
				<img
					src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80"
					alt="Mebel artisan woodworking"
					class="w-full h-full object-cover opacity-90"
					loading="lazy"
				/>
			</div>
		</div>
	</div>
</section>
