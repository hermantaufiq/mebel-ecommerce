<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
	import SeoHead from '$lib/components/seo/SeoHead.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1F1810" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<SeoHead />

<!-- WCAG AA: Skip to Main Content Link -->
<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-[#1F1810] focus:px-4 focus:py-2.5 focus:text-xs focus:font-semibold focus:text-white focus:shadow-xl focus:ring-2 focus:ring-[#B5652F] focus:outline-none"
>
	Lewati ke konten utama &darr;
</a>

<div class="min-h-screen flex flex-col bg-stone-warm text-espresso selection:bg-terracotta selection:text-white">
	<AnnouncementBar />
	<Header />
	<main id="main-content" class="flex-1 focus:outline-none" tabindex="-1">
		{@render children()}
	</main>
	<Footer />
</div>

<!-- Global Toast Notification Container -->
<ToastContainer />
