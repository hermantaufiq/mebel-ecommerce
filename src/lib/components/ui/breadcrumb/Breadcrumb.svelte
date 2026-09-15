<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Home from '@lucide/svelte/icons/house';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	let { items }: { items: BreadcrumbItem[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="text-xs text-muted-foreground">
	<ol class="flex items-center flex-wrap gap-1">
		<li class="flex items-center gap-1">
			<a href="/" class="hover:text-terracotta transition-colors flex items-center gap-1">
				<Home class="w-3 h-3" />
				<span>Beranda</span>
			</a>
		</li>
		{#each items as item, i}
			<li class="flex items-center gap-1">
				<ChevronRight class="w-3 h-3 text-muted-foreground/50" />
				{#if item.href && i < items.length - 1}
					<a href={item.href} class="hover:text-terracotta transition-colors">
						{item.label}
					</a>
				{:else}
					<span class="text-espresso font-medium truncate max-w-[200px]">
						{item.label}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
