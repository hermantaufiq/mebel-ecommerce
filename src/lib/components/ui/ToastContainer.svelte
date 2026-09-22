<script lang="ts">
	import { toast } from '$lib/utils/toast';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Info from '@lucide/svelte/icons/info';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import X from '@lucide/svelte/icons/x';
</script>

{#if toast.toasts.length > 0}
	<aside
		aria-label="Notifikasi"
		aria-live="polite"
		class="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
	>
		{#each toast.toasts as item (item.id)}
			<div
				class="pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 sm:slide-in-from-right-3
				{item.type === 'success' ? 'bg-white/95 border-emerald-200 text-emerald-950 ring-1 ring-emerald-100' : ''}
				{item.type === 'error' ? 'bg-white/95 border-rose-200 text-rose-950 ring-1 ring-rose-100' : ''}
				{item.type === 'warning' ? 'bg-white/95 border-amber-200 text-amber-950 ring-1 ring-amber-100' : ''}
				{item.type === 'info' ? 'bg-white/95 border-sky-200 text-sky-950 ring-1 ring-sky-100' : ''}"
			>
				<div class="shrink-0 mt-0.5">
					{#if item.type === 'success'}
						<CheckCircle2 class="h-4 w-4 text-emerald-600" />
					{:else if item.type === 'error'}
						<AlertCircle class="h-4 w-4 text-rose-600" />
					{:else if item.type === 'warning'}
						<AlertTriangle class="h-4 w-4 text-amber-600" />
					{:else}
						<Info class="h-4 w-4 text-sky-600" />
					{/if}
				</div>

				<div class="flex-1 text-xs font-medium leading-relaxed">
					{item.message}
				</div>

				<button
					type="button"
					onclick={() => toast.dismiss(item.id)}
					class="shrink-0 rounded-md p-0.5 text-stone-400 hover:text-stone-700 transition-colors"
					aria-label="Tutup notifikasi"
				>
					<X class="h-3.5 w-3.5" />
				</button>
			</div>
		{/each}
	</aside>
{/if}
