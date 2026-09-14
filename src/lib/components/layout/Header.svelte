<script lang="ts">
	import { cartStore } from '$lib/stores/cart.svelte';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';

	import Search from '@lucide/svelte/icons/search';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Heart from '@lucide/svelte/icons/heart';
	import User from '@lucide/svelte/icons/user';
	import Menu from '@lucide/svelte/icons/menu';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Sofa from '@lucide/svelte/icons/sofa';
	import Bed from '@lucide/svelte/icons/bed';
	import Utensils from '@lucide/svelte/icons/utensils';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Lamp from '@lucide/svelte/icons/lamp';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import X from '@lucide/svelte/icons/x';
	import Phone from '@lucide/svelte/icons/phone';
	import Compass from '@lucide/svelte/icons/compass';
	import Hammer from '@lucide/svelte/icons/hammer';

	let isScrolled = $state(false);
	let isMobileOpen = $state(false);
	let isSearchOpen = $state(false);
	let searchQuery = $state('');

	function handleScroll() {
		if (typeof window !== 'undefined') {
			isScrolled = window.scrollY > 20;
		}
	}

	function handleSearchSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
			isSearchOpen = false;
			searchQuery = '';
		}
	}

	const roomCategories = [
		{
			name: 'Ruang Tamu',
			slug: 'ruang-tamu',
			desc: 'Sofa modular, armchair & meja kopi jati',
			icon: Sofa
		},
		{
			name: 'Kamar Tidur',
			slug: 'kamar-tidur',
			desc: 'Rangka tempat tidur & nakas minimalis',
			icon: Bed
		},
		{
			name: 'Ruang Makan',
			slug: 'ruang-makan',
			desc: 'Meja makan solid & kursi makan kurasi',
			icon: Utensils
		},
		{
			name: 'Ruang Kerja',
			slug: 'ruang-kerja',
			desc: 'Meja kerja kayu jati & rak buku arsitektural',
			icon: Briefcase
		},
		{
			name: 'Pencahayaan & Aksesori',
			slug: 'pencahayaan',
			desc: 'Lampu gantung tembaga & dekorasi organik',
			icon: Lamp
		}
	];
</script>

<svelte:window onscroll={handleScroll} />

<header
	class={`sticky top-0 z-40 w-full transition-all duration-300 ${
		isScrolled
			? 'bg-stone-warm/95 backdrop-blur-md shadow-sm border-b border-border/80 py-3'
			: 'bg-stone-warm border-b border-border py-4'
	}`}
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
		<!-- Left: Mobile Menu & Desktop Navigation -->
		<div class="flex items-center gap-6">
			<!-- Mobile Hamburger Sheet -->
			<div class="lg:hidden">
				<Sheet.Root bind:open={isMobileOpen}>
					<Sheet.Trigger
						class="inline-flex items-center justify-center p-2 text-espresso hover:bg-sand/40 rounded-md transition-colors"
						aria-label="Buka menu navigasi"
					>
						<Menu class="w-5 h-5" />
					</Sheet.Trigger>
					<Sheet.Content side="left" class="w-[310px] sm:w-[380px] bg-stone-warm border-r border-border p-6 overflow-y-auto">
						<Sheet.Header class="text-left border-b border-border pb-4">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 rounded-full bg-espresso text-stone-warm flex items-center justify-center font-serif text-sm font-bold shadow-sm">
									ML
								</div>
								<div>
									<Sheet.Title class="font-serif text-lg tracking-wider font-semibold text-espresso">
										MAISON LUMINA
									</Sheet.Title>
									<Sheet.Description class="text-xs text-muted-foreground tracking-widest uppercase">
										Atelier &amp; Meubel Indonesia
									</Sheet.Description>
								</div>
							</div>
						</Sheet.Header>

						<!-- Mobile Nav Links -->
						<div class="py-6 space-y-6">
							<div>
								<span class="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-3">
									Koleksi Ruangan
								</span>
								<div class="space-y-1">
									{#each roomCategories as category}
										{@const CategoryIcon = category.icon}
										<a
											href={`/produk?kategori=${category.slug}`}
											onclick={() => (isMobileOpen = false)}
											class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-espresso hover:bg-sand/60 transition-colors group"
										>
											<CategoryIcon class="w-4 h-4 text-terracotta group-hover:scale-110 transition-transform shrink-0" />
											<div class="flex-1">
												<div class="font-medium">{category.name}</div>
												<div class="text-[11px] text-muted-foreground">{category.desc}</div>
											</div>
										</a>
									{/each}
									<a
										href="/produk"
										onclick={() => (isMobileOpen = false)}
										class="flex items-center justify-between px-3 py-2.5 mt-2 rounded-md text-xs font-semibold text-terracotta hover:bg-terracotta/10 transition-colors"
									>
										<span>Jelajahi Semua Produk</span>
										<ArrowRight class="w-3.5 h-3.5" />
									</a>
								</div>
							</div>

							<div class="border-t border-border pt-4">
								<span class="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-3">
									Eksplorasi Atelier
								</span>
								<div class="space-y-1">
									<a
										href="/craftsmanship"
										onclick={() => (isMobileOpen = false)}
										class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-espresso hover:bg-sand/60"
									>
										<Hammer class="w-4 h-4 text-terracotta shrink-0" />
										<span>Craftsmanship &amp; Material</span>
									</a>
									<a
										href="/room-planner"
										onclick={() => (isMobileOpen = false)}
										class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-espresso hover:bg-sand/60"
									>
										<Compass class="w-4 h-4 text-terracotta shrink-0" />
										<span>Interactive Room Planner</span>
									</a>
									<a
										href="/tentang-kami"
										onclick={() => (isMobileOpen = false)}
										class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-espresso hover:bg-sand/60"
									>
										<span>Tentang Maison Lumina</span>
									</a>
								</div>
							</div>

							<div class="border-t border-border pt-4 space-y-2">
								<a
									href="/wishlist"
									onclick={() => (isMobileOpen = false)}
									class="flex items-center justify-between px-3 py-2 text-sm text-espresso hover:bg-sand/60 rounded-md transition-colors"
								>
									<span class="flex items-center gap-2.5">
										<Heart class="w-4 h-4 text-muted-foreground shrink-0" />
										Daftar Keinginan
									</span>
									{#if wishlistStore.itemCount > 0}
										<Badge class="bg-terracotta text-white text-[10px] px-2 py-0.5 border-none font-bold">
											{wishlistStore.itemCount}
										</Badge>
									{/if}
								</a>
								<a
									href="/keranjang"
									onclick={() => (isMobileOpen = false)}
									class="flex items-center justify-between px-3 py-2 text-sm text-espresso hover:bg-sand/60 rounded-md transition-colors"
								>
									<span class="flex items-center gap-2.5">
										<ShoppingBag class="w-4 h-4 text-muted-foreground shrink-0" />
										Keranjang Belanja
									</span>
									{#if cartStore.itemCount > 0}
										<Badge class="bg-espresso text-stone-warm text-[10px] px-2 py-0.5 border-none font-bold">
											{cartStore.itemCount}
										</Badge>
									{/if}
								</a>
								<a
									href="/akun"
									onclick={() => (isMobileOpen = false)}
									class="flex items-center justify-between px-3 py-2 text-sm text-espresso hover:bg-sand/60 rounded-md"
								>
									<span class="flex items-center gap-2.5">
										<User class="w-4 h-4 text-muted-foreground shrink-0" />
										Akun Saya
									</span>
									<span class="text-xs text-muted-foreground">Profil &amp; Pesanan</span>
								</a>
								<a
									href="https://wa.me/6281234567890"
									target="_blank"
									rel="noreferrer"
									class="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-terracotta bg-terracotta/10 rounded-md hover:bg-terracotta/20 transition-colors"
								>
									<Phone class="w-3.5 h-3.5 shrink-0" />
									Hubungi WhatsApp Concierge
								</a>
							</div>
						</div>
					</Sheet.Content>
				</Sheet.Root>
			</div>

			<!-- Desktop Main Menu Links -->
			<nav class="hidden lg:flex items-center gap-8 text-sm font-medium text-espresso/90">
				<a href="/" class="hover:text-terracotta transition-colors py-1">
					Beranda
				</a>

				<!-- Koleksi DropdownMenu -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="inline-flex items-center gap-1 hover:text-terracotta transition-colors py-1 outline-none group cursor-pointer">
						<span>Koleksi</span>
						<ChevronDown class="w-3.5 h-3.5 text-muted-foreground group-hover:text-terracotta transition-transform group-data-[state=open]:rotate-180" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-72 bg-white/98 backdrop-blur-md border border-border shadow-xl p-2 rounded-lg" align="start">
						<DropdownMenu.Label class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-1.5">
							Kurasi Berdasarkan Ruang
						</DropdownMenu.Label>
						<DropdownMenu.Separator class="bg-border/60" />
						{#each roomCategories as category}
							{@const CategoryIcon = category.icon}
							<DropdownMenu.Item
								onSelect={() => goto(`/produk?kategori=${category.slug}`)}
								class="flex items-start gap-3 px-2.5 py-2 rounded-md hover:bg-sand/60 cursor-pointer transition-colors group"
							>
								<CategoryIcon class="w-4 h-4 text-terracotta shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
								<div>
									<div class="text-xs font-semibold text-espresso">{category.name}</div>
									<div class="text-[10px] text-muted-foreground leading-tight">{category.desc}</div>
								</div>
							</DropdownMenu.Item>
						{/each}
						<DropdownMenu.Separator class="bg-border/60" />
						<DropdownMenu.Item
							onSelect={() => goto('/produk')}
							class="flex items-center justify-between px-2.5 py-2 text-xs font-medium text-terracotta hover:bg-terracotta/10 rounded-md cursor-pointer transition-colors"
						>
							<span>Lihat Semua Katalog</span>
							<ArrowRight class="w-3 h-3" />
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<a href="/craftsmanship" class="hover:text-terracotta transition-colors py-1">
					Craftsmanship
				</a>

				<a href="/room-planner" class="hover:text-terracotta transition-colors py-1 flex items-center gap-1">
					<span>Room Planner</span>
					<span class="px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-terracotta text-white rounded">
						3D Beta
					</span>
				</a>

				<a href="/tentang-kami" class="hover:text-terracotta transition-colors py-1">
					Tentang Kami
				</a>
			</nav>
		</div>

		<!-- Center: Brand Logo & Monogram -->
		<div class="flex items-center justify-center text-center">
			<a href="/" class="group flex items-center gap-3">
				<div class="w-9 h-9 rounded-full bg-espresso text-stone-warm flex items-center justify-center font-serif text-base font-bold shadow-sm group-hover:bg-terracotta transition-colors">
					ML
				</div>
				<div class="text-left sm:text-center">
					<span class="font-serif text-lg sm:text-xl font-bold tracking-[0.18em] text-espresso uppercase block leading-none">
						MAISON LUMINA
					</span>
					<span class="text-[9px] sm:text-[10px] tracking-[0.25em] text-muted-foreground uppercase block font-medium mt-1">
						Atelier &amp; Meubel
					</span>
				</div>
			</a>
		</div>

		<!-- Right: Action Icons (Search, Wishlist, Cart, Profile) -->
		<div class="flex items-center gap-1 sm:gap-2">
			<!-- Quick Search Toggle / Input -->
			{#if isSearchOpen}
				<form
					onsubmit={handleSearchSubmit}
					class="relative hidden sm:flex items-center animate-in fade-in zoom-in-95 duration-200"
				>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari sofa, jati, meja..."
						class="w-48 lg:w-60 h-8 pl-8 pr-7 text-xs bg-white border border-border rounded-full focus:outline-none focus:border-terracotta shadow-inner"
					/>
					<Search class="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
					<button
						type="button"
						onclick={() => (isSearchOpen = false)}
						class="absolute right-2 text-muted-foreground hover:text-espresso"
						aria-label="Tutup pencarian"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				</form>
			{:else}
				<button
					type="button"
					class="p-2 text-espresso hover:bg-sand/40 rounded-full transition-colors hidden sm:flex items-center justify-center"
					onclick={() => (isSearchOpen = true)}
					aria-label="Cari produk"
				>
					<Search class="w-4 h-4" />
				</button>
			{/if}

			<!-- Wishlist Link & Badge -->
			<a
				href="/wishlist"
				class="relative p-2 text-espresso hover:text-terracotta hover:bg-sand/40 rounded-full transition-colors flex items-center justify-center"
				aria-label="Daftar Keinginan"
			>
				<Heart class="w-4 h-4 sm:w-5 sm:h-5" />
				{#if wishlistStore.itemCount > 0}
					<Badge
						variant="destructive"
						class="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full bg-terracotta text-white font-bold border-2 border-stone-warm shadow-sm"
					>
						{wishlistStore.itemCount}
					</Badge>
				{/if}
			</a>

			<!-- Cart Link & Badge -->
			<a
				href="/keranjang"
				class="relative p-2 text-espresso hover:text-terracotta hover:bg-sand/40 rounded-full transition-colors flex items-center justify-center"
				aria-label="Keranjang Belanja"
			>
				<ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5" />
				{#if cartStore.itemCount > 0}
					<Badge
						variant="default"
						class="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full bg-espresso text-white font-bold border-2 border-stone-warm shadow-sm"
					>
						{cartStore.itemCount}
					</Badge>
				{/if}
			</a>

			<!-- Profile / Account -->
			<a
				href="/akun"
				class="p-2 text-espresso hover:text-terracotta hover:bg-sand/40 rounded-full transition-colors flex items-center justify-center"
				aria-label="Akun Saya"
			>
				<User class="w-4 h-4 sm:w-5 sm:h-5" />
			</a>
		</div>
	</div>
</header>
