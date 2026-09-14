<script lang="ts">
	import Phone from '@lucide/svelte/icons/phone';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Truck from '@lucide/svelte/icons/truck';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	const announcements = [
		{ icon: Truck, text: 'Gratis Pengiriman & Perakitan Area Jabodetabek' },
		{ icon: Sparkles, text: 'Kurasi Kayu Jati Solid Bergaransi Konstruksi 5 Tahun' },
		{ icon: ShieldCheck, text: 'Layanan White-Glove Handcrafted Delivery' }
	];

	let currentIndex = $state(0);

	$effect(() => {
		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % announcements.length;
		}, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="bg-espresso text-stone-warm px-4 py-2 text-xs tracking-wider border-b border-white/10 transition-colors">
	<div class="max-w-7xl mx-auto flex items-center justify-between">
		<!-- Left: Quick Concierge Contact -->
		<div class="hidden sm:flex items-center gap-2 text-sand/80 hover:text-white transition-colors">
			<Phone class="w-3.5 h-3.5 text-terracotta" />
			<a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" class="hover:underline">
				Concierge: +62 812-3456-7890
			</a>
		</div>

		<!-- Center: Rotating Promo Message -->
		<div class="flex items-center justify-center flex-1 sm:flex-initial text-center mx-auto overflow-hidden min-h-5 py-0.5">
			{#key currentIndex}
				{@const CurrentIcon = announcements[currentIndex].icon}
				<div class="flex items-center gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 text-[10px] min-[360px]:text-[11px] sm:text-xs text-center justify-center">
					<CurrentIcon class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terracotta shrink-0" />
					<span class="font-medium text-stone-warm truncate max-w-[260px] min-[380px]:max-w-[320px] sm:max-w-none">{announcements[currentIndex].text}</span>
				</div>
			{/key}
		</div>

		<!-- Right: Flag / Language & Boutique Hours -->
		<div class="hidden md:flex items-center gap-4 text-sand/80 text-[11px]">
			<span>Senin – Sabtu: 09.00 – 20.00 WIB</span>
			<span class="text-white/20">|</span>
			<span class="flex items-center gap-1.5 font-medium text-stone-warm">
				<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
				Boutique Kemang Buka
			</span>
		</div>
	</div>
</div>
