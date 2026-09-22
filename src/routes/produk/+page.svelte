<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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

	let { data }: { data: PageData } = $props();

	const rooms = ['Ruang Tamu', 'Kamar Tidur', 'Ruang Makan', 'Ruang Kerja', 'Pencahayaan', 'Dekorasi'] as const;
	const statusOptions = ['Ready Stock', 'Pre-Order', 'Bestseller', 'Terbatas'] as const;
	const materialOptions = ['Jati', 'Rotan', 'Bambu', 'MDF', 'Besi', 'Kain', 'Kulit'];
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

	// --- Local UI state (initialized from server data.filters) ---
	let selectedRooms = $state<string[]>([]);
	let selectedCategories = $state<string[]>([]);
	let selectedMaterials = $state<string[]>([]);
	let selectedStatuses = $state<string[]>([]);
	let selectedPriceRange = $state<number | null>(null);
	let sortBy = $state('terbaru');
	let searchQuery = $state('');
	let mobileFilterOpen = $state(false);

	// Sync from server data on page load / navigation
	$effect(() => {
		const filters = data.filters;
		searchQuery = filters.q ?? '';
		sortBy = filters.sort ?? 'terbaru';
		selectedMaterials = filters.materials ?? [];
		selectedStatuses = filters.statuses ?? [];

		// Parse price range from min/max
		if (filters.priceMin || filters.priceMax) {
			const idx = priceRanges.findIndex(
				(r) =>
					String(r.min) === filters.priceMin &&
					(r.max === Infinity ? !filters.priceMax : String(r.max) === filters.priceMax)
			);
			selectedPriceRange = idx >= 0 ? idx : null;
		} else {
			selectedPriceRange = null;
		}
	});

	// --- Data from server ---
	let products = $derived(data.products);
	let categories = $derived(data.categories);
	let totalPages = $derived(data.totalPages);
	let currentPage = $derived(data.currentPage);
	let totalCount = $derived(data.totalCount);

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

	// --- URL Navigation helpers ---
	function buildSearchParams(overrides: Record<string, string | string[] | number | null> = {}): string {
		const params = new URLSearchParams();
		const q = 'q' in overrides ? overrides['q'] : searchQuery;
		const sort = 'sort' in overrides ? overrides['sort'] : sortBy;
		const mats = 'materials' in overrides ? overrides['materials'] : selectedMaterials;
		const stats = 'statuses' in overrides ? overrides['statuses'] : selectedStatuses;
		const priceIdx = 'priceRange' in overrides ? overrides['priceRange'] : selectedPriceRange;
		const pg = 'page' in overrides ? overrides['page'] : '1';
		const kat = 'kategori' in overrides ? overrides['kategori'] : ($page.url.searchParams.get('kategori') ?? '');

		if (typeof q === 'string' && q.trim()) params.set('q', q.trim());
		if (typeof sort === 'string' && sort !== 'terbaru') params.set('sort', sort);
		if (Array.isArray(mats)) mats.forEach(m => params.append('material', m));
		if (Array.isArray(stats)) stats.forEach(s => params.append('status', s));
		if (typeof kat === 'string' && kat) params.set('kategori', kat);

		if (priceIdx !== null && typeof priceIdx === 'number') {
			const range = priceRanges[priceIdx];
			if (range) {
				params.set('price_min', String(range.min));
				if (range.max !== Infinity) params.set('price_max', String(range.max));
			}
		}
		const pageNum = typeof pg === 'string' ? pg : String(pg ?? 1);
		if (pageNum && pageNum !== '1') params.set('page', pageNum);
		return `?${params.toString()}`;
	}

	function navigate(overrides: Record<string, string | string[] | number | null> = {}) {
		goto(`/produk${buildSearchParams(overrides)}`, { keepFocus: true });
	}

	function toggleArrayItem(arr: string[], item: string): string[] {
		return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
	}

	function handleRoomToggle(room: string) {
		const newRooms = toggleArrayItem(selectedRooms, room);
		selectedRooms = newRooms;
		// Navigate with room as kategori
		const roomSlug = room.toLowerCase().replace(/\s+/g, '-');
		navigate({ kategori: newRooms.includes(room) ? roomSlug : '' });
	}

	function handleCategoryToggle(catId: string) {
		const cat = categories.find(c => c.id === catId);
		if (!cat) return;
		navigate({ kategori: cat.slug });
	}

	function handleMaterialToggle(material: string) {
		const newMats = toggleArrayItem(selectedMaterials, material);
		selectedMaterials = newMats;
		navigate({ materials: newMats });
	}

	function handleStatusToggle(status: string) {
		const newStats = toggleArrayItem(selectedStatuses, status);
		selectedStatuses = newStats;
		navigate({ statuses: newStats });
	}

	function handlePriceRange(index: number) {
		const newIdx = selectedPriceRange === index ? null : index;
		selectedPriceRange = newIdx;
		navigate({ priceRange: newIdx });
	}

	function handleSort(value: string) {
		sortBy = value;
		navigate({ sort: value });
	}

	function resetFilters() {
		selectedRooms = [];
		selectedCategories = [];
		selectedMaterials = [];
		selectedStatuses = [];
		selectedPriceRange = null;
		searchQuery = '';
		sortBy = 'terbaru';
		goto('/produk');
	}

	function goToPage(pg: number) {
		const safe = Math.max(1, Math.min(pg, totalPages));
		navigate({ page: String(safe) });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	let searchDebounce: ReturnType<typeof setTimeout>;
	function handleSearchInput() {
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(() => {
			navigate({ q: searchQuery });
		}, 400);
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
			Temukan {totalCount} karya mebel premium dari atelier kami
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
						oninput={handleSearchInput}
						placeholder="Cari di katalog..."
						class="w-full h-9 pl-8 pr-3 text-xs bg-white border border-border rounded-lg focus:outline-none focus:border-terracotta transition-colors"
					/>
					<Search class="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
					{#if searchQuery}
						<button
							type="button"
							onclick={() => { searchQuery = ''; navigate({ q: '' }); }}
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
									{totalCount} produk ditemukan
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
									Tampilkan {totalCount} Produk
								</button>
							</div>
						</Sheet.Content>
					</Sheet.Root>
				</div>

				<!-- Product Count -->
				<span class="hidden sm:block text-xs text-muted-foreground">
					{products.length} dari {totalCount} produk
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
			{#if products.length > 0}
				<div class="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
					{#each products as product (product.id)}
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
				{@const isActive = selectedMaterials.includes(mat)}
				<label class="flex items-center gap-2.5 cursor-pointer group">
					<input
						type="checkbox"
						checked={isActive}
						onchange={() => handleMaterialToggle(mat)}
						class="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta/50 accent-terracotta"
					/>
					<span class={`text-xs transition-colors ${isActive ? 'text-espresso font-medium' : 'text-muted-foreground group-hover:text-espresso'}`}>
						{mat}
					</span>
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
				</label>
			{/each}
		</div>
	</div>
{/snippet}
