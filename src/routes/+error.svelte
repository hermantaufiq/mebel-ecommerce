<script lang="ts">
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Compass from '@lucide/svelte/icons/compass';
	import Phone from '@lucide/svelte/icons/phone';

	let status = $derived(page.status);
	let message = $derived(page.error?.message || 'Terjadi kendala pada halaman yang Anda tuju.');

	let is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Halaman Tidak Ditemukan (404)' : 'Terjadi Kendala Teknis'} | Maison Lumina</title>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="min-h-[75vh] flex items-center justify-center bg-[#F7F3EC] px-4 py-16 sm:px-6 lg:px-8">
	<div class="max-w-xl w-full text-center">
		<!-- Atelier Brand Badge -->
		<div class="inline-flex items-center gap-2 rounded-full border border-[#E8DFD0] bg-white px-4 py-1.5 shadow-2xs mb-6">
			<Compass class="h-4 w-4 text-[#B5652F]" />
			<span class="text-xs font-semibold tracking-wider uppercase text-stone-700">
				Maison Lumina Atelier
			</span>
		</div>

		<!-- Status Code -->
		<div class="font-serif text-7xl sm:text-8xl font-bold text-[#1F1810]/20 select-none tracking-tight">
			{status}
		</div>

		<!-- Main Message -->
		<h1 class="font-serif text-2xl sm:text-3xl font-bold text-[#1F1810] mt-2">
			{#if is404}
				Karya Furnitur Tidak Ditemukan
			{:else}
				Terjadi Kendala pada Sistem Atelier
			{/if}
		</h1>

		<p class="mt-3 text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
			{#if is404}
				Halaman atau karya furnitur yang Anda cari mungkin telah dipindahkan, berganti nama, atau sudah tidak tersedia dalam kurasi kami.
			{:else}
				{message}
			{/if}
		</p>

		<!-- Action CTA Buttons -->
		<div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
			<a
				href="/"
				class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F1810] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#B5652F] transition-colors"
			>
				<ArrowLeft class="h-4 w-4" />
				<span>Kembali ke Beranda</span>
			</a>

			<a
				href="/produk"
				class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DFD0] bg-white px-6 py-3 text-xs font-semibold text-[#1F1810] shadow-2xs hover:bg-[#FAF8F5] transition-colors"
			>
				<span>Jelajahi Koleksi</span>
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>

		<!-- Concierge Assistance Link -->
		<div class="mt-10 border-t border-[#E8DFD0] pt-6">
			<p class="text-xs text-stone-500">
				Butuh bantuan langsung dari konsultan interior kami?
			</p>
			<a
				href="https://wa.me/6281234567890?text=Halo%20Maison%20Lumina,%20saya%20mengalami%20kendala%20saat%20mengakses%20halaman"
				target="_blank"
				rel="noreferrer"
				class="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5652F] hover:underline"
			>
				<Phone class="h-3.5 w-3.5" />
				<span>Hubungi Concierge via WhatsApp (+62 812-3456-7890)</span>
			</a>
		</div>
	</div>
</div>
