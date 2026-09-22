<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		title?: string;
		description?: string;
		image?: string;
		type?: string;
		canonical?: string;
		jsonLd?: Record<string, any> | Array<Record<string, any>> | null;
	}

	let {
		title = 'Maison Lumina — Atelier & Meubel Indonesia',
		description = 'Kurasi mebel kayu jati solid premium dengan desain arsitektural kontemporer, bergaransi 5 tahun, pengiriman & perakitan gratis se-Jabodetabek.',
		image = '/images/og-maison-lumina.jpg',
		type = 'website',
		canonical,
		jsonLd = null
	}: Props = $props();

	let fullTitle = $derived(
		title.includes('Maison Lumina') ? title : `${title} | Maison Lumina`
	);

	let currentUrl = $derived(canonical || page.url.href);
</script>

<svelte:head>
	<!-- Standard Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={currentUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content="Maison Lumina" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:image" content={image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	<!-- Structured Data (JSON-LD) -->
	{#if jsonLd}
		<script type="application/ld+json">
			{JSON.stringify(jsonLd)}
		</script>
	{/if}
</svelte:head>
