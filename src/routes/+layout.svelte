<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AnnouncementBar from '$lib/components/layout/AnnouncementBar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Maison Lumina — Atelier & Meubel Indonesia</title>
	<meta
		name="description"
		content="Kurasi mebel kayu jati solid premium dengan desain arsitektural kontemporer, bergaransi 5 tahun, pengiriman & perakitan gratis se-Jabodetabek."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen flex flex-col bg-stone-warm text-espresso selection:bg-terracotta selection:text-white">
	<AnnouncementBar />
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
