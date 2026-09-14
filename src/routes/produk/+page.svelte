<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { products, categories, materialOptions } from '$lib/mockData';
	import type { Product } from '$lib/types';
	import { formatRupiah } from '$lib/utils';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';

	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import X from '@lucide/svelte/icons/x';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Search from '@lucide/svelte/icons/search';
	import PackageOpen from '@lucide/svelte/icons/package-open';

	const ITEMS_PER_PAGE = 12;

	const rooms = ['Ruang Tamu', 'Kamar Tidur', 'Ruang Makan', 'Ruang Kerja', 'Pencahayaan', 'Dekorasi'] as const;
	const statusOptions = ['Ready Stock', 'Pre-Order', 'Bestseller', 'Terbatas'] as const;
	const priceRanges = [
		{ label: '< Rp 5 Juta', min: 0, max: 5000000 },
		{ label: 'Rp 5 - 10 Juta', min: 5000000, max: 10000000 },
		{ label: 'Rp 10 - 20 Juta', min: 10000000, max: 20000000 },
		{ label: '> Rp 20 Juta', min: 20000000, max: Infinity }
	];
	const sortOptions = [
		{ value: 'terbaru', label: 'Terbaru' },
		{ value: 'harga-asc', label: 'Harga Terendah' },
		{ value: 'harga-desc', label: 'Harga Tertinggi' },
		{ value: 'rating', label: 'Rating Tertinggi' },
		{ value: 'nama', label: 'Nama A-Z' }
	];

	// --- State from URL params ---
	let selectedRooms = $state<string[]>([]);
	let selectedCategories = $state<string[]>([]);
	let selectedMaterials = $state<string[]>([]);
	let selectedStatuses = $state<string[]>([]);
	let selectedPriceRange = $state<number | null>(null);
	let sortBy = $state('terbaru');
	let currentPage = $state(1);
	let searchQuery = $state('');
	let mobileFilterOpen = $state(false);

	// Read initial URL params
	$effect(() => {
		const params = $page.url.searchParams;
		const kategori = params.get('kategori');
		if (kategori) {
			// Try matching as room slug
			const matchRoom = rooms.find(r => r.toLowerCase().replace(/\s+/g, '-') === kategori);
			if (matchRoom) {
				selectedRooms = [matchRoom];
			} else {
				// Try matching as category slug
				const matchCat = categories.find(c => c.slug === kategori);
				if (matchCat) {
					selectedCategories = [matchCat.id];
				}
			}
		}
		const sort = params.get('sort');
		if (sort && sortOptions.some(s => s.value === sort)) {
			sortBy = sort;
		}
		const pg = params.get('page');
		if (pg && !isNaN(Number(pg))) {
			currentPage = Math.max(1, Number(pg));
		}
		const q = params.get('q');
		if (q) {
			searchQuery = q;
		}
	});

	// --- Derived: filtered & sorted products ---
	let filteredProducts = $derived.by(() => {
		let result = [...products];

		// Search
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			result = result.filter(p =>
				p.name.toLowerCase().includes(q) ||
				p.material.toLowerCase().includes(q) ||
				(p.description && p.description.toLowerCase().includes(q)) ||
				(p.categoryName && p.categoryName.toLowerCase().includes(q))
			);
		}

		// Room filter
		if (selectedRooms.length > 0) {
			result = result.filter(p => p.room && selectedRooms.includes(p.room));
		}

		// Category filter
		if (selectedCategories.length > 0) {
			result = result.filter(p => selectedCategories.includes(p.categoryId));
		}

		// Material filter
		if (selectedMaterials.length > 0) {
			result = result.filter(p =>
				selectedMaterials.some(m => p.material.toLowerCase().includes(m.toLowerCase()))
			);
		}

		// Status filter
		if (selectedStatuses.length > 0) {
			result = result.filter(p => selectedStatuses.includes(p.status));
		}

		// Price range filter
		if (selectedPriceRange !== null) {
			const range = priceRanges[selectedPriceRange];
			if (range) {
				result = result.filter(p => p.price >= range.min && p.price < range.max);
			}
		}

		// Sort
		switch (sortBy) {
			case 'harga-asc':
				result.sort((a, b) => a.price - b.price);
				break;
			case 'harga-desc':
				result.sort((a, b) => b.price - a.price);
				break;
			case 'rating':
				result.sort((a, b) => b.rating - a.rating);
				break;
			case 'nama':
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
			default:
				// terbaru — keep original order (mock default)
				break;
		}

		return result;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)));
	let paginatedProducts = $derived(
		filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
	);

	let activeFilterCount = $derived(
		selectedRooms.length +
		selectedCategories.length +
		selectedMaterials.length +
		selectedStatuses.length +
		(selectedPriceRange !== null ? 1 : 0) +
		(searchQuery.trim() ? 1 : 0)
	);

	// Available categories filtered by selected rooms
	let availableCategories = $derived.by(() => {
		if (selectedRooms.length === 0) return categories;
		return categories.filter(c => selectedRooms.includes(c.room));
	});

	function toggleArrayItem(arr: string[], item: string): string[] {
		return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
	}

	function handleRoomToggle(room: string) {
		selectedRooms = toggleArrayItem(selectedRooms, room);
		// Clear selected categories that no longer match
		if (selectedRooms.length > 0) {
			const validCatIds = categories.filter(c => selectedRooms.includes(c.room)).map(c => c.id);
			selectedCategories = selectedCategories.filter(id => validCatIds.includes(id));
		}
		currentPage = 1;
	}

	function handleCategoryToggle(catId: string) {
		selectedCategories = toggleArrayItem(selectedCategories, catId);
		currentPage = 1;
	}

	function handleMaterialToggle(material: string) {
		selectedMaterials = toggleArrayItem(selectedMaterials, material);
		currentPage = 1;
	}

	function handleStatusToggle(status: string) {
		selectedStatuses = toggleArrayItem(selectedStatuses, status);
		currentPage = 1;
	}

	function handlePriceRange(index: number) {
		selectedPriceRange = selectedPriceRange === index ? null : index;
		currentPage = 1;
	}

	function handleSort(value: string) {
		sortBy = value;
		currentPage = 1;
	}

	function resetFilters() {
		selectedRooms = [];
		selectedCategories = [];
		selectedMaterials = [];
		selectedStatuses = [];
		selectedPriceRange = null;
		searchQuery = '';
		currentPage = 1;
		sortBy = 'terbaru';
	}

	function goToPage(pg: number) {
		currentPage = Math.max(1, Math.min(pg, totalPages));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Katalog Produk — Maison Lumina</title>
	<meta name="description" content="Jelajahi koleksi mebel kayu jati solid premium Maison Lumina. Filter berdasarkan ruangan, material, dan harga." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
	<!-- Breadcrumb -->
	<Breadcrumb items={[{ label: 'Katalog Produk' }]} />

	<!-- Page Header -->
	<div class="mt-4 mb-6 sm:mb-8">
		<h1 class="font-serif text-2xl sm:text-3xl font-semibold text-espresso">
			Katalog Koleksi
		</h1>
		<p class="text-sm text-muted-foreground mt-1">
			Temukan {filteredProducts.length} karya mebel premium dari atelier kami
		</p>
	</div>

	<div class="flex gap-8">
		<!-- ════════ SIDEBAR FILTER (Desktop) ════════ -->
		<aside class="hidden lg:block w-[280px] shrink-0">
			<div class="sticky top-28 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-8">
				<!-- Filter Header -->
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-semibold text-espresso flex items-center gap-2">
						<SlidersHorizontal class="w-4 h-4 text-terracotta" />
						Filter
						{#if activeFilterCount > 0}
							<Badge class="bg-terracotta text-white text-[10px] h-5 min-w-5 px-1.5">
								{activeFilterCount}
							</Badge>
						{/if}
					</h2>
					{#if activeFilterCount > 0}
						<button
							type="button"
							onclick={resetFilters}
							class="text-xs text-terracotta hover:underline flex items-center gap-1"
						>
							<RotateCcw class="w-3 h-3" />
							Reset
						</button>
					{/if}
				</div>

				<!-- Search within catalog -->
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari di katalog..."
						class="w-full h-9 pl-8 pr-3 text-xs bg-white border border-border rounded-lg focus:outline-none focus:border-terracotta transition-colors"
					/>
					<Search class="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
					{#if searchQuery}
						<button
							type="button"
							onclick={() => { searchQuery = ''; currentPage = 1; }}
							class="absolute right-2 top-2 text-muted-foreground hover:text-espresso"
						>
							<X class="w-3.5 h-3.5" />
						</button>
					{/if}
				</div>

				{@render filterContent()}
			</div>
		</aside>

		<!-- ════════ MAIN CONTENT ════════ -->
		<main class="flex-1 min-w-0">
			<!-- Toolbar: Mobile Filter + Sort -->
			<div class="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-border/60">
				<!-- Mobile Filter Button -->
				<div class="lg:hidden">
					<Sheet.Root bind:open={mobileFilterOpen}>
						<Sheet.Trigger
							class="inline-flex items-center gap-2 h-9 px-3 text-xs font-medium bg-white border border-border rounded-lg hover:bg-sand/40 transition-colors"
						>
							<SlidersHorizontal class="w-4 h-4" />
							<span>Filter</span>
							{#if activeFilterCount > 0}
								<Badge class="bg-terracotta text-white text-[10px] h-5 min-w-5 px-1">
									{activeFilterCount}
								</Badge>
							{/if}
						</Sheet.Trigger>
						<Sheet.Content side="left" class="w-[85vw] max-w-[340px] sm:w-[380px] bg-stone-warm border-r border-border p-5 sm:p-6 overflow-y-auto">
							<Sheet.Header class="border-b border-border pb-4">
								<div class="flex items-center justify-between">
									<Sheet.Title class="text-sm font-semibold text-espresso flex items-center gap-2">
										<SlidersHorizontal class="w-4 h-4 text-terracotta" />
										Filter Produk
									</Sheet.Title>
									{#if activeFilterCount > 0}
										<button
											type="button"
											onclick={resetFilters}
											class="text-xs text-terracotta hover:underline flex items-center gap-1"
										>
											<RotateCcw class="w-3 h-3" />
											Reset
										</button>
									{/if}
								</div>
								<Sheet.Description class="text-xs text-muted-foreground">
									{filteredProducts.length} produk ditemukan
								</Sheet.Description>
							</Sheet.Header>
							<div class="py-4 space-y-5">
								{@render filterContent()}
							</div>
							<div class="border-t border-border pt-4">
								<button
									type="button"
									onclick={() => { mobileFilterOpen = false; }}
									class="w-full h-10 bg-espresso text-white text-xs font-semibold tracking-wider uppercase rounded-lg hover:bg-terracotta transition-colors"
								>
									Tampilkan {filteredProducts.length} Produk
								</button>
							</div>
						</Sheet.Content>
					</Sheet.Root>
				</div>

				<!-- Product Count -->
				<span class="hidden sm:block text-xs text-muted-foreground">
					Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} dari {filteredProducts.length} produk
				</span>

				<!-- Sort Dropdown -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="inline-flex items-center gap-2 h-9 px-3 text-xs font-medium bg-white border border-border rounded-lg hover:bg-sand/40 transition-colors ml-auto cursor-pointer"
					>
						<ArrowUpDown class="w-3.5 h-3.5 text-muted-foreground" />
						<span class="hidden sm:inline">{sortOptions.find(s => s.value === sortBy)?.label || 'Urutkan'}</span>
						<span class="sm:hidden">Urutkan</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-48 bg-white border border-border shadow-lg rounded-lg p-1" align="end">
						{#each sortOptions as option}
							<DropdownMenu.Item
								onSelect={() => handleSort(option.value)}
								class={`text-xs px-3 py-2 rounded-md cursor-pointer transition-colors ${
									sortBy === option.value ? 'bg-sand font-semibold text-espresso' : 'hover:bg-sand/40'
								}`}
							>
								{option.label}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<!-- Product Grid -->
			{#if paginatedProducts.length > 0}
				<div class="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
					{#each paginatedProducts as product (product.id)}
						<ProductCard {product} />
					{/each}
				</div>

				<!-- Pagination -->
				{#if totalPages > 1}
					<nav class="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-border/60" aria-label="Pagination">
						<button
							type="button"
							onclick={() => goToPage(currentPage - 1)}
							disabled={currentPage <= 1}
							class="p-2 rounded-md border border-border bg-white hover:bg-sand/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
							aria-label="Halaman sebelumnya"
						>
							<ChevronLeft class="w-4 h-4" />
						</button>

						{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pg}
							{#if pg === 1 || pg === totalPages || (pg >= currentPage - 1 && pg <= currentPage + 1)}
								<button
									type="button"
									onclick={() => goToPage(pg)}
									class={`h-9 min-w-9 px-3 text-xs font-medium rounded-md border transition-colors ${
										pg === currentPage
											? 'bg-espresso text-white border-espresso'
											: 'bg-white border-border hover:bg-sand/40'
									}`}
								>
									{pg}
								</button>
							{:else if pg === currentPage - 2 || pg === currentPage + 2}
								<span class="text-muted-foreground text-xs px-1">…</span>
							{/if}
						{/each}

						<button
							type="button"
							onclick={() => goToPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
							class="p-2 rounded-md border border-border bg-white hover:bg-sand/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
							aria-label="Halaman berikutnya"
						>
							<ChevronRight class="w-4 h-4" />
						</button>
					</nav>
				{/if}
			{:else}
				<!-- Empty State -->
				<div class="flex flex-col items-center justify-center py-20 text-center">
					<div class="w-16 h-16 rounded-full bg-sand/60 flex items-center justify-center mb-4">
						<PackageOpen class="w-8 h-8 text-muted-foreground" />
					</div>
					<h3 class="font-serif text-lg font-semibold text-espresso mb-1">
						Tidak ada produk ditemukan
					</h3>
					<p class="text-xs text-muted-foreground max-w-sm mb-4">
						Coba ubah kata kunci pencarian atau reset filter untuk melihat koleksi lengkap kami.
					</p>
					<button
						type="button"
						onclick={resetFilters}
						class="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold bg-espresso text-white rounded-lg hover:bg-terracotta transition-colors"
					>
						<RotateCcw class="w-3.5 h-3.5" />
						Reset Semua Filter
					</button>
				</div>
			{/if}
		</main>
	</div>
</div>

<!-- ════════ FILTER CONTENT SNIPPET ════════ -->
{#snippet filterContent()}
	<!-- Room Filter -->
	<div class="space-y-2.5">
		<h3 class="text-xs font-semibold text-espresso uppercase tracking-wider">Ruangan</h3>
		<div class="space-y-1.5">
			{#each rooms as room}
				{@const isActive = selectedRooms.includes(room)}
				{@const count = products.filter(p => p.room === room).length}
				<label class="flex items-center gap-2.5 cursor-pointer group">
					<input
						type="checkbox"
						checked={isActive}
						onchange={() => handleRoomToggle(room)}
						class="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta/50 accent-terracotta"
					/>
					<span class={`text-xs transition-colors ${isActive ? 'text-espresso font-medium' : 'text-muted-foreground group-hover:text-espresso'}`}>
						{room}
					</span>
					<span class="text-[10px] text-muted-foreground/60 ml-auto">({count})</span>
				</label>
			{/each}
		</div>
	</div>

	<!-- Category Filter -->
	{#if availableCategories.length > 0}
		<div class="space-y-2.5 border-t border-border/60 pt-4">
			<h3 class="text-xs font-semibold text-espresso uppercase tracking-wider">Kategori</h3>
			<div class="space-y-1.5">
				{#each availableCategories as cat}
					{@const isActive = selectedCategories.includes(cat.id)}
					<label class="flex items-center gap-2.5 cursor-pointer group">
						<input
							type="checkbox"
							checked={isActive}
							onchange={() => handleCategoryToggle(cat.id)}
							class="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta/50 accent-terracotta"
						/>
						<span class={`text-xs transition-colors ${isActive ? 'text-espresso font-medium' : 'text-muted-foreground group-hover:text-espresso'}`}>
							{cat.name}
						</span>
						<span class="text-[10px] text-muted-foreground/60 ml-auto">({cat.productCount})</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Price Range -->
	<div class="space-y-2.5 border-t border-border/60 pt-4">
		<h3 class="text-xs font-semibold text-espresso uppercase tracking-wider">Rentang Harga</h3>
		<div class="grid grid-cols-2 gap-1.5">
			{#each priceRanges as range, i}
				{@const isActive = selectedPriceRange === i}
				<button
					type="button"
					onclick={() => handlePriceRange(i)}
					class={`h-8 px-2 text-[11px] font-medium rounded-md border transition-colors ${
						isActive
							? 'bg-terracotta text-white border-terracotta'
							: 'bg-white border-border text-muted-foreground hover:border-terracotta/50 hover:text-espresso'
					}`}
				>
					{range.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Material Filter -->
	<div class="space-y-2.5 border-t border-border/60 pt-4">
		<h3 class="text-xs font-semibold text-espresso uppercase tracking-wider">Material</h3>
		<div class="space-y-1.5">
			{#each materialOptions as mat}
				{@const isActive = selectedMaterials.includes(mat.label)}
				<label class="flex items-center gap-2.5 cursor-pointer group">
					<input
						type="checkbox"
						checked={isActive}
						onchange={() => handleMaterialToggle(mat.label)}
						class="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta/50 accent-terracotta"
					/>
					<span class={`text-xs transition-colors ${isActive ? 'text-espresso font-medium' : 'text-muted-foreground group-hover:text-espresso'}`}>
						{mat.label}
					</span>
					<span class="text-[10px] text-muted-foreground/60 ml-auto">({mat.count})</span>
				</label>
			{/each}
		</div>
	</div>

	<!-- Status Filter -->
	<div class="space-y-2.5 border-t border-border/60 pt-4">
		<h3 class="text-xs font-semibold text-espresso uppercase tracking-wider">Ketersediaan</h3>
		<div class="space-y-1.5">
			{#each statusOptions as status}
				{@const isActive = selectedStatuses.includes(status)}
				{@const count = products.filter(p => p.status === status).length}
				<label class="flex items-center gap-2.5 cursor-pointer group">
					<input
						type="checkbox"
						checked={isActive}
						onchange={() => handleStatusToggle(status)}
						class="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta/50 accent-terracotta"
					/>
					<span class={`text-xs transition-colors ${isActive ? 'text-espresso font-medium' : 'text-muted-foreground group-hover:text-espresso'}`}>
						{status}
					</span>
					<span class="text-[10px] text-muted-foreground/60 ml-auto">({count})</span>
				</label>
			{/each}
		</div>
	</div>
{/snippet}
