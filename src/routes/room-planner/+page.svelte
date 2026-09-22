<script lang="ts">
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import { roomPlannerStore, type RoomType } from '$lib/stores/roomPlanner.svelte';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { products } from '$lib/mockData';
	import { formatRupiah } from '$lib/utils';
	import type { PlacedRoomItem } from '$lib/types';

	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Save from '@lucide/svelte/icons/save';
	import Grid3x3 from '@lucide/svelte/icons/grid-3x3';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';
	import Check from '@lucide/svelte/icons/check';
	import Phone from '@lucide/svelte/icons/phone';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Move from '@lucide/svelte/icons/move';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Info from '@lucide/svelte/icons/info';

	const breadcrumbItems = [{ label: 'Studio Ruang Virtual' }];

	const roomTabs: { key: RoomType; label: string; desc: string }[] = [
		{ key: 'ruang-tamu', label: 'Ruang Tamu', desc: 'Ukuran Standar: 5.0m × 4.2m' },
		{ key: 'kamar-tidur', label: 'Kamar Tidur', desc: 'Ukuran Standar: 4.5m × 4.0m' },
		{ key: 'ruang-makan', label: 'Ruang Makan Zen', desc: 'Ukuran Standar: 4.8m × 3.8m' }
	];

	const categoryTabs = ['Semua', 'Duduk', 'Meja', 'Kamar', 'Dekor'];

	let activeCategory = $state('Semua');
	let searchQuery = $state('');
	let toastMessage = $state<string | null>(null);
	let showBuyModal = $state(false);

	let canvasEl = $state<HTMLDivElement | null>(null);
	let draggingId = $state<string | null>(null);
	let dragStartPointer = { x: 0, y: 0 };
	let dragStartItem = { x: 0, y: 0 };

	const filteredProducts = $derived(
		products.filter((p) => {
			const query = searchQuery.trim().toLowerCase();
			const matchSearch =
				!query ||
				p.name.toLowerCase().includes(query) ||
				(p.material && p.material.toLowerCase().includes(query)) ||
				(p.categoryName && p.categoryName.toLowerCase().includes(query));

			if (!matchSearch) return false;

			if (activeCategory === 'Semua') return true;
			if (activeCategory === 'Duduk') return ['cat-1', 'cat-2', 'cat-7'].includes(p.categoryId);
			if (activeCategory === 'Meja') return ['cat-3', 'cat-4', 'cat-6', 'cat-8'].includes(p.categoryId);
			if (activeCategory === 'Kamar') return ['cat-5', 'cat-6'].includes(p.categoryId);
			if (activeCategory === 'Dekor') return ['cat-9', 'cat-10'].includes(p.categoryId);
			return true;
		})
	);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) {
				toastMessage = null;
			}
		}, 3000);
	}

	function handlePointerDown(e: PointerEvent, item: PlacedRoomItem) {
		if (e.button !== 0) return;
		e.stopPropagation();
		roomPlannerStore.selectItem(item.instanceId);
		draggingId = item.instanceId;
		dragStartPointer = { x: e.clientX, y: e.clientY };
		dragStartItem = { x: item.x, y: item.y };

		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!draggingId || !canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;

		const deltaPixelsX = e.clientX - dragStartPointer.x;
		const deltaPixelsY = e.clientY - dragStartPointer.y;

		const deltaPercentX = (deltaPixelsX / rect.width) * 100;
		const deltaPercentY = (deltaPixelsY / rect.height) * 100;

		const newX = Math.max(6, Math.min(94, dragStartItem.x + deltaPercentX));
		const newY = Math.max(6, Math.min(94, dragStartItem.y + deltaPercentY));

		roomPlannerStore.updatePosition(draggingId, newX, newY);
	}

	function handlePointerUp(e: PointerEvent) {
		if (draggingId) {
			try {
				(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
			} catch {
				// ignore
			}
			draggingId = null;
		}
	}

	function handleSaveDesign() {
		showToast('Denah ruangan berhasil disimpan ke memori browser Anda.');
	}

	function handleResetCanvas() {
		if (confirm('Apakah Anda yakin ingin mengosongkan seluruh furnitur di denah?')) {
			roomPlannerStore.resetCanvas();
			showToast('Kanvas telah diatur ulang.');
		}
	}

	function handleBuyAll() {
		if (roomPlannerStore.placedItems.length === 0) return;

		const cartItems = roomPlannerStore.placedItems.map((item) => ({
			productId: item.product.id,
			variantId: null,
			name: item.product.name,
			image: item.product.images?.[0]?.url || '/placeholder.png',
			unitPrice: item.product.price,
			qty: 1,
			maxStock: 99,
			material: item.product.material,
			slug: item.product.slug
		}));

		cartStore.addMultipleItems(cartItems);
		showBuyModal = true;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if (roomPlannerStore.selectedInstanceId) {
			if (e.key === 'Delete' || e.key === 'Backspace') {
				e.preventDefault();
				roomPlannerStore.removeFromCanvas(roomPlannerStore.selectedInstanceId);
				showToast('Item dihapus dari kanvas.');
			} else if (e.key.toLowerCase() === 'r') {
				e.preventDefault();
				roomPlannerStore.rotateItem(roomPlannerStore.selectedInstanceId, 45);
			}
		}
	}

	const waConsultationLink = $derived.by(() => {
		const items = roomPlannerStore.placedItems.map((i) => `• ${i.product.name}`).join('%0A');
		const total = formatRupiah(roomPlannerStore.totalEstimate);
		const text = `Halo Concierge Maison Lumina, saya baru saja menyusun tata letak untuk *${roomPlannerStore.roomType.replace('-', ' ').toUpperCase()}* di Studio Virtual:%0A${items}%0A%0A*Total Estimasi:* ${total}%0A%0AMohon bantuan konsultasi dimensi & ketersediaan stok. Terima kasih.`;
		return `https://wa.me/6281234567890?text=${text}`;
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Studio Ruang Virtual (Room Planner) | Maison Lumina</title>
	<meta
		name="description"
		content="Rancang denah tata letak furnitur ruang tamu, kamar tidur, atau ruang makan Anda secara interaktif 2D dengan koleksi kayu jati solid Maison Lumina."
	/>
</svelte:head>

<!-- Toast Notification -->
{#if toastMessage}
	<div class="fixed bottom-6 right-6 z-50 bg-espresso text-stone-warm px-4 py-3 rounded-xl shadow-2xl border border-border flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
		<Check class="w-4 h-4 text-terracotta" />
		<span class="text-xs font-medium">{toastMessage}</span>
	</div>
{/if}

<div class="page-fade-in bg-stone-warm min-h-screen">
	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<Breadcrumb items={breadcrumbItems} />

		<!-- Header -->
		<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 my-6 pb-6 border-b border-border">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand/60 text-espresso text-[11px] font-semibold tracking-wider uppercase mb-2">
					<Sparkles class="w-3.5 h-3.5 text-terracotta" />
					<span>Visualizer &amp; Denah Interaktif</span>
				</div>
				<h1 class="font-serif text-3xl sm:text-4xl font-bold text-espresso tracking-tight">
					Studio Ruang Virtual
				</h1>
				<p class="text-sm text-espresso/70 mt-1 max-w-xl leading-relaxed">
					Simulasikan penempatan furnitur butik Maison Lumina langsung di denah ruangan Anda. Geser, putar sudut, dan wujudkan keharmonisan proporsi interior idaman.
				</p>
			</div>

			<div class="flex items-center gap-3 flex-wrap">
				<button
					onclick={handleResetCanvas}
					class="px-4 py-2.5 text-xs font-semibold border border-border rounded-xl bg-white text-espresso hover:bg-sand/40 transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
				>
					<RotateCw class="w-3.5 h-3.5" />
					<span>Atur Ulang</span>
				</button>
				<button
					onclick={handleSaveDesign}
					class="px-4 py-2.5 text-xs font-semibold bg-espresso text-stone-warm rounded-xl hover:bg-espresso-soft transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
				>
					<Save class="w-3.5 h-3.5" />
					<span>Simpan Desain</span>
				</button>
			</div>
		</div>

		<!-- Main Workspace Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-12">
			<!-- LEFT: Product Catalog Sidebar (order-2 on mobile so canvas is visible first) -->
			<div class="lg:col-span-4 order-2 lg:order-1 flex flex-col bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-xs h-[420px] sm:h-[500px] lg:h-[640px]">
				<div class="flex items-center justify-between mb-3">
					<h2 class="font-serif text-base font-bold text-espresso">Katalog Furnitur</h2>
					<span class="text-[11px] text-muted-foreground font-medium">{filteredProducts.length} item</span>
				</div>

				<!-- Search Input -->
				<div class="relative mb-3">
					<Search class="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari sofa, kursi, meja..."
						class="w-full pl-9 pr-3 py-2 text-xs bg-stone-warm/50 border border-border rounded-xl focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
					/>
					{#if searchQuery}
						<button
							onclick={() => (searchQuery = '')}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-espresso"
						>
							<X class="w-3.5 h-3.5" />
						</button>
					{/if}
				</div>

				<!-- Category Chips -->
				<div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
					{#each categoryTabs as cat}
						<button
							onclick={() => (activeCategory = cat)}
							class={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
								activeCategory === cat
									? 'bg-espresso text-stone-warm'
									: 'bg-sand/40 text-espresso/70 hover:bg-sand/70'
							}`}
						>
							{cat}
						</button>
					{/each}
				</div>

				<!-- Products List (Scrollable) -->
				<div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
					{#if filteredProducts.length === 0}
						<div class="h-48 flex flex-col items-center justify-center text-center p-4">
							<p class="text-xs font-semibold text-espresso">Produk tidak ditemukan</p>
							<p class="text-[11px] text-muted-foreground mt-1">Coba kata kunci lain atau ganti kategori.</p>
						</div>
					{:else}
						{#each filteredProducts as p (p.id)}
							<div class="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-stone-warm/40 transition-all group">
								<div class="w-14 h-14 rounded-lg overflow-hidden bg-sand/30 flex-shrink-0 border border-border/50">
									<img src={p.images[0]?.url} alt={p.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-[10px] uppercase tracking-wider text-terracotta font-semibold truncate">
										{p.categoryName || 'Maison Lumina'}
									</p>
									<p class="text-xs font-bold text-espresso truncate">{p.name}</p>
									<p class="text-xs text-espresso/75 font-medium mt-0.5">{formatRupiah(p.price)}</p>
								</div>
								<button
									onclick={() => roomPlannerStore.addToCanvas(p)}
									class="w-8 h-8 rounded-lg bg-espresso text-stone-warm flex items-center justify-center hover:bg-terracotta transition-colors flex-shrink-0 shadow-2xs cursor-pointer"
									title="Tambahkan ke Kanvas"
								>
									<Plus class="w-4 h-4" />
								</button>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- RIGHT: Interactive Canvas Area (order-1 on mobile) -->
			<div class="lg:col-span-8 order-1 lg:order-2 flex flex-col space-y-4">
				<!-- Canvas Control Toolbar -->
				<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-border shadow-xs">
					<!-- Room Tabs -->
					<div class="flex items-center gap-1 bg-sand/30 p-1 rounded-xl overflow-x-auto scrollbar-none">
						{#each roomTabs as tab}
							<button
								onclick={() => roomPlannerStore.setRoomType(tab.key)}
								class={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
									roomPlannerStore.roomType === tab.key
										? 'bg-espresso text-stone-warm shadow-xs'
										: 'text-espresso/70 hover:text-espresso'
								}`}
							>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Presets & Grid Toggle -->
					<div class="flex items-center justify-between sm:justify-end gap-2">
						<button
							onclick={() => roomPlannerStore.loadPreset(roomPlannerStore.roomType)}
							class="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-terracotta hover:bg-sand/30 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
							title="Muat contoh tata letak kurasi desainer interior"
						>
							<Sparkles class="w-3.5 h-3.5" />
							<span>Muat Template</span>
						</button>

						<button
							onclick={() => roomPlannerStore.toggleGrid()}
							class={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
								roomPlannerStore.showGrid
									? 'bg-sand/40 border-terracotta/40 text-espresso'
									: 'bg-white border-border text-muted-foreground'
							}`}
						>
							<Grid3x3 class="w-3.5 h-3.5 text-terracotta" />
							<span>Grid {roomPlannerStore.showGrid ? 'On' : 'Off'}</span>
						</button>
					</div>
				</div>

				<!-- Interactive 2D Floor Plan Canvas -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					bind:this={canvasEl}
					onpointerdown={() => roomPlannerStore.selectItem(null)}
					class={`relative w-full h-[360px] sm:h-[420px] lg:h-[480px] bg-white rounded-2xl border-2 border-dashed border-border/80 overflow-hidden select-none transition-colors ${
						roomPlannerStore.showGrid ? 'canvas-grid' : ''
					}`}
				>
					<!-- Canvas Architectural Corner Badges -->
					<div class="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-2">
						<span class="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-md border border-border text-[10px] font-bold text-espresso uppercase tracking-wider shadow-2xs">
							{roomTabs.find((r) => r.key === roomPlannerStore.roomType)?.label}
						</span>
						<span class="px-2 py-1 bg-sand/60 rounded-md text-[10px] font-medium text-espresso/80">
							Skala Denah 1:20
						</span>
					</div>

					<div class="absolute top-3 right-3 z-10 pointer-events-none">
						<span class="px-2 py-1 bg-white/80 rounded-md text-[10px] text-muted-foreground border border-border/60">
							Tarik &amp; lepas furnitur untuk memindahkan posisi
						</span>
					</div>

					<!-- Empty Canvas State -->
					{#if roomPlannerStore.placedItems.length === 0}
						<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
							<div class="w-16 h-16 rounded-2xl bg-sand/50 flex items-center justify-center text-terracotta mb-4 shadow-xs">
								<Move class="w-8 h-8" />
							</div>
							<h3 class="font-serif text-xl font-bold text-espresso mb-1">
								Denah Ruangan Masih Kosong
							</h3>
							<p class="text-xs text-espresso/70 max-w-sm leading-relaxed mb-4">
								Pilih furnitur dari katalog di sebelah kiri dan klik tombol tambah (+) atau klik tombol "Muat Template" di atas untuk memulai inspirasi rancangan.
							</p>
							<button
								onclick={() => roomPlannerStore.loadPreset(roomPlannerStore.roomType)}
								class="pointer-events-auto px-4 py-2 bg-espresso text-stone-warm text-xs font-semibold rounded-xl hover:bg-espresso-soft transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
							>
								<Sparkles class="w-3.5 h-3.5 text-terracotta" />
								<span>Gunakan Template {roomTabs.find((r) => r.key === roomPlannerStore.roomType)?.label}</span>
							</button>
						</div>
					{:else}
						<!-- Placed Furniture Items -->
						{#each roomPlannerStore.placedItems as item (item.instanceId)}
							{@const isSelected = roomPlannerStore.selectedInstanceId === item.instanceId}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								onpointerdown={(e) => handlePointerDown(e, item)}
								onpointermove={handlePointerMove}
								onpointerup={handlePointerUp}
								class={`absolute z-20 cursor-grab active:cursor-grabbing group touch-none transition-[box-shadow,transform] duration-75 ${
									isSelected ? 'z-30' : ''
								}`}
								style={`left: ${item.x}%; top: ${item.y}%; transform: translate(-50%, -50%) rotate(${item.rotation}deg);`}
							>
								<!-- Item Container Card -->
								<div
									class={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white p-1 border-2 transition-all shadow-md ${
										isSelected
											? 'border-terracotta ring-4 ring-terracotta/20 shadow-xl'
											: 'border-espresso/40 hover:border-espresso'
									}`}
								>
									<img
										src={item.product.images[0]?.url}
										alt={item.product.name}
										class="w-full h-full object-cover rounded-xl pointer-events-none"
									/>

									<!-- Directional Orientation Indicator -->
									<div class="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-terracotta/80 rounded-full"></div>
								</div>

								<!-- Floating Control Toolbar when Selected/Hovered -->
								<div
									class={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-espresso text-stone-warm p-1 rounded-lg shadow-xl border border-white/20 transition-opacity pointer-events-auto ${
										isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95'
									}`}
									style={`transform: translate(-50%, 0) rotate(-${item.rotation}deg);`}
								>
									<!-- Rotate 45deg button -->
									<button
										onclick={(e) => {
											e.stopPropagation();
											roomPlannerStore.rotateItem(item.instanceId, 45);
										}}
										class="w-6 h-6 rounded flex items-center justify-center hover:bg-white/20 transition-colors text-stone-warm cursor-pointer"
										title="Putar Sudut 45° (R)"
									>
										<RotateCw class="w-3.5 h-3.5" />
									</button>

									<!-- Delete button -->
									<button
										onclick={(e) => {
											e.stopPropagation();
											roomPlannerStore.removeFromCanvas(item.instanceId);
										}}
										class="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/80 transition-colors text-red-300 hover:text-white cursor-pointer"
										title="Hapus Item (Del)"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</div>

								<!-- Label Badge under Item -->
								<div
									class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-espresso/90 backdrop-blur-xs text-[10px] font-semibold text-stone-warm shadow-xs pointer-events-none"
									style={`transform: translate(-50%, 0) rotate(-${item.rotation}deg);`}
								>
									{item.product.name.split(' ').slice(0, 2).join(' ')}
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Canvas Bottom Summary Card -->
				<div class="bg-white rounded-2xl border border-border p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
					<div class="flex items-center gap-3 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start">
						<div>
							<p class="text-[9px] sm:text-[10px] uppercase tracking-wider text-terracotta font-bold">ITEM TERPASANG</p>
							<p class="font-serif text-sm sm:text-xl font-bold text-espresso">{roomPlannerStore.itemCount} Item</p>
						</div>
						<div class="h-7 w-px bg-border"></div>
						<div>
							<p class="text-[9px] sm:text-[10px] uppercase tracking-wider text-terracotta font-bold">TOTAL ESTIMASI SET</p>
							<p class="font-serif text-sm sm:text-xl font-bold text-espresso">{formatRupiah(roomPlannerStore.totalEstimate)}</p>
						</div>
					</div>

					<div class="flex items-center gap-3 w-full sm:w-auto">
						<button
							onclick={handleBuyAll}
							disabled={roomPlannerStore.itemCount === 0}
							class="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-terracotta text-white font-semibold text-xs rounded-xl hover:bg-terracotta-hover transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
						>
							<ShoppingBag class="w-4 h-4" />
							<span>Beli Semua Set Ini</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Interior Design Consultation Section -->
		<section class="bg-sand/40 border border-border rounded-3xl p-8 lg:p-12 mb-12 relative overflow-hidden">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				<div class="lg:col-span-8 space-y-4">
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-espresso text-[11px] font-semibold tracking-wider uppercase">
						<Info class="w-3.5 h-3.5 text-terracotta" />
						<span>Atelier Private Concierge</span>
					</div>
					<h2 class="font-serif text-2xl sm:text-3xl font-bold text-espresso leading-tight">
						Butuh Bantuan Penataan Khusus Hunian Anda?
					</h2>
					<p class="text-sm text-espresso/75 leading-relaxed max-w-2xl">
						Konsultasikan denah yang telah Anda susun dengan tim Interior Architect Maison Lumina. Kami siap memberikan masukan pencahayaan, pemilihan varian kain, serta pengukuran dimensi langsung ke lokasi Anda.
					</p>
				</div>

				<div class="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
					<a
						href={waConsultationLink}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-espresso text-stone-warm font-semibold text-xs rounded-xl hover:bg-espresso-soft transition-colors shadow-xs"
					>
						<Phone class="w-4 h-4 text-terracotta" />
						<span>Konsultasi Denah via WhatsApp</span>
					</a>
					<a
						href="/produk"
						class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-espresso font-semibold text-xs rounded-xl border border-border hover:bg-sand/30 transition-colors shadow-2xs"
					>
						<span>Lihat Seluruh Katalog</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>
		</section>
	</div>
</div>

<!-- Modal: Sukses Tambah Semua ke Keranjang -->
{#if showBuyModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-xs animate-in fade-in duration-200">
		<div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border relative text-center">
			<button
				onclick={() => (showBuyModal = false)}
				class="absolute top-4 right-4 text-muted-foreground hover:text-espresso p-1 cursor-pointer"
			>
				<X class="w-5 h-5" />
			</button>

			<div class="w-14 h-14 rounded-2xl bg-sand/60 text-terracotta flex items-center justify-center mx-auto mb-4">
				<Check class="w-7 h-7 stroke-[2.5]" />
			</div>

			<h3 class="font-serif text-2xl font-bold text-espresso mb-2">
				Set Berhasil Ditambahkan!
			</h3>
			<p class="text-xs text-espresso/70 leading-relaxed mb-6">
				Seluruh <strong>{roomPlannerStore.itemCount} furnitur</strong> dari denah ruangan Anda telah dimasukkan ke keranjang belanja Anda.
			</p>

			<div class="p-4 bg-stone-warm rounded-2xl border border-border text-left mb-6 space-y-2 max-h-40 overflow-y-auto">
				{#each roomPlannerStore.placedItems as item}
					<div class="flex items-center justify-between text-xs">
						<span class="font-semibold text-espresso truncate max-w-[200px]">{item.product.name}</span>
						<span class="text-muted-foreground font-medium">{formatRupiah(item.product.price)}</span>
					</div>
				{/each}
				<div class="border-t border-border pt-2 flex items-center justify-between text-xs font-bold text-espresso">
					<span>Total Estimasi Set</span>
					<span class="text-terracotta">{formatRupiah(roomPlannerStore.totalEstimate)}</span>
				</div>
			</div>

			<div class="flex flex-col gap-2.5">
				<a
					href="/keranjang"
					class="w-full py-3.5 bg-terracotta text-white font-semibold text-xs rounded-xl hover:bg-terracotta-hover transition-colors shadow-xs flex items-center justify-center gap-2"
				>
					<ShoppingBag class="w-4 h-4" />
					<span>Buka Keranjang &amp; Checkout</span>
				</a>
				<button
					onclick={() => (showBuyModal = false)}
					class="w-full py-3 bg-white text-espresso font-semibold text-xs rounded-xl border border-border hover:bg-stone-warm transition-colors cursor-pointer"
				>
					Lanjutkan Mendesain Ruangan
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbars */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #d9cebe;
		border-radius: 4px;
	}
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-none {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
