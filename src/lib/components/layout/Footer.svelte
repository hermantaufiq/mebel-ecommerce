<script lang="ts">
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	let email = $state('');
	let subscribed = $state(false);

	function handleSubscribe(e: SubmitEvent) {
		e.preventDefault();
		if (email.trim()) {
			subscribed = true;
			email = '';
		}
	}
</script>

<footer class="bg-espresso text-stone-warm border-t border-espresso-soft mt-auto">
	<!-- Trust Badges Bar -->
	<div class="border-b border-white/10 py-8 bg-black/20">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
			<div class="flex items-center justify-center md:justify-start gap-4">
				<div class="w-10 h-10 rounded-full bg-terracotta/20 border border-terracotta/40 flex items-center justify-center text-terracotta shrink-0">
					<Sparkles class="w-5 h-5" />
				</div>
				<div>
					<h3 class="font-serif font-semibold text-sm text-white">Kayu Jati Grade-A & Solid</h3>
					<p class="text-xs text-sand/70 mt-0.5">Bersumber lestari dengan oven drying kiln tingkat presisi</p>
				</div>
			</div>

			<div class="flex items-center justify-center md:justify-start gap-4">
				<div class="w-10 h-10 rounded-full bg-terracotta/20 border border-terracotta/40 flex items-center justify-center text-terracotta shrink-0">
					<ShieldCheck class="w-5 h-5" />
				</div>
				<div>
					<h3 class="font-serif font-semibold text-sm text-white">Garansi Konstruksi 5 Tahun</h3>
					<p class="text-xs text-sand/70 mt-0.5">Jaminan integritas sambungan purus & struktur mebel</p>
				</div>
			</div>

			<div class="flex items-center justify-center md:justify-start gap-4">
				<div class="w-10 h-10 rounded-full bg-terracotta/20 border border-terracotta/40 flex items-center justify-center text-terracotta shrink-0">
					<Clock class="w-5 h-5" />
				</div>
				<div>
					<h3 class="font-serif font-semibold text-sm text-white">White-Glove Delivery & Perakitan</h3>
					<p class="text-xs text-sand/70 mt-0.5">Gratis Jabodetabek dengan tim instalasi tersertifikasi</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Footer Columns -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
			<!-- Col 1 & 2: Brand Story & Atelier Details -->
			<div class="lg:col-span-2 space-y-6">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-white text-espresso flex items-center justify-center font-serif text-lg font-bold shadow-md">
						ML
					</div>
					<div>
						<span class="font-serif text-xl font-bold tracking-[0.16em] text-white uppercase block">
							MAISON LUMINA
						</span>
						<span class="text-[10px] tracking-[0.25em] text-sand/70 uppercase block font-medium">
							Atelier &amp; Meubel Indonesia
						</span>
					</div>
				</div>

				<p class="text-xs sm:text-sm text-sand/80 leading-relaxed font-light pr-4">
					Maison Lumina memadukan kemurnian kayu jati tropis Nusantara dengan estetika desain modern mid-century dan Japandi kontemporer. Diciptakan dengan sentuhan tangan pengrajin Jepara untuk menghadirkan ketenangan dan keanggunan abadi di setiap sudut hunian Anda.
				</p>

				<div class="space-y-2.5 text-xs text-sand/90">
					<div class="flex items-start gap-3">
						<MapPin class="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
						<span>Flagship Boutique: Jl. Kemang Raya No. 42, Bangka, Jakarta Selatan 12730</span>
					</div>
					<div class="flex items-center gap-3">
						<Clock class="w-4 h-4 text-terracotta shrink-0" />
						<span>Senin – Sabtu: 09.00 – 20.00 WIB | Minggu: 10.00 – 18.00 WIB</span>
					</div>
					<div class="flex items-center gap-3">
						<Phone class="w-4 h-4 text-terracotta shrink-0" />
						<a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" class="hover:text-white underline-offset-2 hover:underline">
							WhatsApp Concierge: +62 812-3456-7890
						</a>
					</div>
				</div>
			</div>

			<!-- Col 3: Koleksi Ruang -->
			<div class="space-y-4">
				<h4 class="font-serif text-sm font-semibold tracking-wider text-white uppercase border-b border-white/10 pb-2">
					Koleksi Ruang
				</h4>
				<ul class="space-y-2.5 text-xs text-sand/80">
					<li>
						<a href="/produk?kategori=ruang-tamu" class="hover:text-terracotta transition-colors">
							Ruang Tamu &amp; Lounge
						</a>
					</li>
					<li>
						<a href="/produk?kategori=kamar-tidur" class="hover:text-terracotta transition-colors">
							Kamar Tidur &amp; Rangka Ranjang
						</a>
					</li>
					<li>
						<a href="/produk?kategori=ruang-makan" class="hover:text-terracotta transition-colors">
							Ruang Makan &amp; Dining Table
						</a>
					</li>
					<li>
						<a href="/produk?kategori=ruang-kerja" class="hover:text-terracotta transition-colors">
							Ruang Kerja &amp; Meja Studio
						</a>
					</li>
					<li>
						<a href="/produk?kategori=pencahayaan" class="hover:text-terracotta transition-colors">
							Pencahayaan &amp; Aksesori
						</a>
					</li>
					<li>
						<a href="/produk" class="text-terracotta font-medium hover:underline inline-flex items-center gap-1 mt-1">
							Semua Katalog Produk <ArrowRight class="w-3 h-3" />
						</a>
					</li>
				</ul>
			</div>

			<!-- Col 4: Layanan & Informasi -->
			<div class="space-y-4">
				<h4 class="font-serif text-sm font-semibold tracking-wider text-white uppercase border-b border-white/10 pb-2">
					Layanan &amp; Atelier
				</h4>
				<ul class="space-y-2.5 text-xs text-sand/80">
					<li>
						<a href="/craftsmanship" class="hover:text-terracotta transition-colors">
							Craftsmanship &amp; Material
						</a>
					</li>
					<li>
						<a href="/room-planner" class="hover:text-terracotta transition-colors flex items-center gap-1.5">
							<span>3D Room Planner</span>
							<span class="px-1 py-0.2 text-[8px] bg-terracotta text-white rounded font-bold uppercase">Beta</span>
						</a>
					</li>
					<li>
						<a href="/tentang-kami" class="hover:text-terracotta transition-colors">
							Filosofi &amp; Cerita Kami
						</a>
					</li>
					<li>
						<a href="/akun" class="hover:text-terracotta transition-colors">
							Riwayat Pesanan &amp; Profil
						</a>
					</li>
					<li>
						<a href="/faq" class="hover:text-terracotta transition-colors">
							Perawatan Kayu &amp; Garansi
						</a>
					</li>
					<li>
						<a href="/kebijakan-pengiriman" class="hover:text-terracotta transition-colors">
							Kebijakan Pengiriman &amp; Instalasi
						</a>
					</li>
				</ul>
			</div>

			<!-- Col 5: Newsletter & Wawasan Desain -->
			<div class="space-y-4">
				<h4 class="font-serif text-sm font-semibold tracking-wider text-white uppercase border-b border-white/10 pb-2">
					Newsletter Atelier
				</h4>
				<p class="text-xs text-sand/80 leading-relaxed">
					Dapatkan kurasi katalog musiman, wawasan desain arsitektural, dan undangan eksklusif peluncuran koleksi terbatas.
				</p>

				{#if subscribed}
					<div class="p-3 rounded bg-terracotta/20 border border-terracotta/40 flex items-center gap-2 text-xs text-sand-light">
						<CheckCircle2 class="w-4 h-4 text-terracotta shrink-0" />
						<span>Terima kasih telah bergabung dengan jurnal Maison Lumina.</span>
					</div>
				{:else}
					<form onsubmit={handleSubscribe} class="space-y-2">
						<div class="relative">
							<input
								type="email"
								required
								placeholder="Masukkan alamat email Anda"
								bind:value={email}
								class="w-full h-10 px-3 pr-10 text-xs bg-white/10 border border-white/20 rounded-md text-white placeholder:text-sand/50 focus:outline-none focus:border-terracotta focus:bg-white/15 transition-all"
							/>
							<Mail class="w-4 h-4 text-sand/60 absolute right-3 top-3 pointer-events-none" />
						</div>
						<button
							type="submit"
							class="w-full h-9 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold tracking-wider uppercase rounded-md transition-colors shadow-sm flex items-center justify-center gap-1.5"
						>
							<span>Langganan</span>
							<ArrowRight class="w-3.5 h-3.5" />
						</button>
					</form>
				{/if}
				<p class="text-[10px] text-sand/50">
					Kami menghormati privasi Anda. Anda dapat berhenti berlangganan kapan saja.
				</p>
			</div>
		</div>

		<!-- Bottom Bar & Copyright -->
		<div class="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand/60">
			<div>
				&copy; 2026 Maison Lumina Atelier Indonesia. Seluruh Hak Cipta Dilindungi.
			</div>
			<div class="flex items-center gap-6">
				<a href="/syarat-ketentuan" class="hover:text-sand transition-colors">Syarat &amp; Ketentuan</a>
				<a href="/kebijakan-privasi" class="hover:text-sand transition-colors">Kebijakan Privasi</a>
				<a href="/lacak-pesanan" class="hover:text-sand transition-colors">Lacak Pesanan</a>
			</div>
		</div>
	</div>
</footer>
