<script lang="ts">
	import type { Product } from '$lib/types';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { wishlistStore } from '$lib/stores/wishlist.svelte';
	import { formatRupiah } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';

	import Heart from '@lucide/svelte/icons/heart';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Star from '@lucide/svelte/icons/star';
	import Check from '@lucide/svelte/icons/check';

	let { product }: { product: Product } = $props();

	let addedFeedback = $state(false);

	function handleAddToCart(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		cartStore.addItem({
			productId: product.id,
			variantId: product.variants?.[0]?.id || null,
			name: product.name,
			image: product.images[0]?.url || '',
			unitPrice: product.price,
			qty: 1,
			maxStock: product.variants?.[0]?.stock || 20,
			material: product.material,
			variantLabel: product.variants?.[0]?.label || undefined,
			slug: product.slug
		});
		addedFeedback = true;
		setTimeout(() => { addedFeedback = false; }, 1500);
	}

	function handleToggleWishlist(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		wishlistStore.toggleWishlist({
			id: product.id,
			productId: product.id,
			name: product.name,
			slug: product.slug,
			image: product.images[0]?.url || '',
			price: product.price,
			material: product.material,
			category: product.categoryName,
			status: product.status,
			rating: product.rating,
			colorSwatches: product.colorSwatches
		});
	}

	let isWishlisted = $derived(wishlistStore.isWishlisted(product.id));
</script>

<a
	href={`/produk/${product.slug}`}
	class="group bg-white rounded-xl border border-border/80 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
>
	<!-- Image -->
	<div class="relative aspect-[4/5] overflow-hidden bg-sand/20">
		<img
			src={product.images[0]?.url}
			alt={product.name}
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
			loading="lazy"
		/>

		<!-- Status Badge -->
		{#if product.status}
			<div class="absolute top-3 left-3">
				<Badge class="bg-espresso/90 text-stone-warm text-[10px] font-medium tracking-wide backdrop-blur-sm shadow-sm">
					{product.status}
				</Badge>
			</div>
		{/if}

		<!-- Wishlist Button -->
		<button
			type="button"
			onclick={handleToggleWishlist}
			class="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-sm hover:bg-white hover:scale-110 transition-all"
			aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
		>
			<Heart
				class={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-terracotta text-terracotta' : 'text-espresso/70'}`}
			/>
		</button>

		<!-- Color Swatches Overlay -->
		{#if product.colorSwatches && product.colorSwatches.length > 0}
			<div class="absolute bottom-3 left-3 flex items-center gap-1">
				{#each product.colorSwatches.slice(0, 4) as hex}
					<span
						class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
						style="background-color: {hex};"
					></span>
				{/each}
				{#if product.colorSwatches.length > 4}
					<span class="text-[10px] text-white/90 font-medium bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
						+{product.colorSwatches.length - 4}
					</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Info -->
	<div class="p-4 flex-1 flex flex-col justify-between space-y-2.5">
		<div>
			<div class="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
				<span class="truncate">{product.categoryName || product.room || 'Mebel'}</span>
				{#if product.rating}
					<div class="flex items-center gap-1 text-amber-600 font-medium shrink-0">
						<Star class="w-3 h-3 fill-amber-500 text-amber-500" />
						<span>{product.rating}</span>
						<span class="text-muted-foreground/60">({product.reviewCount})</span>
					</div>
				{/if}
			</div>

			<h3 class="font-serif font-semibold text-sm text-espresso line-clamp-2 group-hover:text-terracotta transition-colors leading-snug">
				{product.name}
			</h3>

			<p class="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
				{product.material}
			</p>
		</div>

		<div class="pt-2 border-t border-border/60 flex items-center justify-between gap-1.5 sm:gap-2">
			<span class="font-semibold text-xs sm:text-sm text-espresso truncate">
				{formatRupiah(product.price)}
			</span>

			<button
				type="button"
				onclick={handleAddToCart}
				class={`inline-flex items-center justify-center gap-1 h-8 px-2 sm:px-3 text-xs font-medium rounded-md transition-all shrink-0 ${
					addedFeedback
						? 'bg-emerald-600 text-white scale-95'
						: 'bg-espresso hover:bg-terracotta text-white'
				}`}
				aria-label={`Tambah ${product.name} ke keranjang`}
			>
				{#if addedFeedback}
					<Check class="w-3.5 h-3.5" />
					<span class="hidden min-[380px]:inline">Masuk</span>
				{:else}
					<ShoppingBag class="w-3.5 h-3.5" />
					<span class="hidden min-[380px]:inline">+ Cart</span>
				{/if}
			</button>
		</div>
	</div>
</a>
