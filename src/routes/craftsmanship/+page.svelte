<script lang="ts">
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Hammer from '@lucide/svelte/icons/hammer';
	import Shield from '@lucide/svelte/icons/shield';
	import Droplets from '@lucide/svelte/icons/droplets';
	import Compass from '@lucide/svelte/icons/compass';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Award from '@lucide/svelte/icons/award';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';

	const breadcrumbItems = [{ label: 'Craftsmanship' }];

	const workshopPhotos = [
		{
			src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
			step: '01',
			title: 'Seleksi Kayu Jati Perhutani',
			desc: 'Setiap batang kayu berumur 30+ tahun diperiksa alur serat, kepadatan lingkaran tahun, dan bebas retak internal.'
		},
		{
			src: 'https://images.unsplash.com/photo-1622201426167-3ae49d0a5a63?w=800&q=80',
			step: '02',
			title: 'Sambungan Mortise & Tenon',
			desc: 'Tukang kayu senior Jepara memahat lidah dan lubang purus secara presisi tanpa bantuan paku besi.'
		},
		{
			src: 'https://images.unsplash.com/photo-1616627577385-5c0c4dab55a1?w=800&q=80',
			step: '03',
			title: 'Pengamplasan Tangan Multi-Tahap',
			desc: 'Permukaan kayu diamplas manual melalui 5 tingkat kehalusan grit amplas hingga menghasilkan sentuhan sehalus sutra.'
		},
		{
			src: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80',
			step: '04',
			title: 'Infusi Beeswax & Minyak Alami',
			desc: 'Formula racikan lilin lebah alami dan minyak biji rami meresap ke pori kayu tanpa meninggalkan residu kimia berbau.'
		}
	];
</script>

<svelte:head>
	<title>Craftsmanship &amp; Warisan Kayu Jati | Maison Lumina</title>
	<meta
		name="description"
		content="Dedikasi tanpa kompromi pengrajin Jepara. Temukan proses pembuatan furniture kayu jati solid Maison Lumina dengan teknik sambungan purba dan sentuhan finishing alami."
	/>
</svelte:head>

<div class="page-fade-in bg-stone-warm min-h-screen">
	<!-- Hero Section -->
	<section class="relative h-[65vh] min-h-[500px] overflow-hidden bg-espresso flex items-center justify-center">
		<img
			src="https://images.unsplash.com/photo-1622201426167-3ae49d0a5a63?w=1800&q=85"
			alt="Pengrajin kayu Maison Lumina di Jepara"
			class="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/50 to-espresso/30"></div>

		<div class="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] uppercase tracking-[0.25em] font-medium mb-6">
				<Sparkles class="w-3.5 h-3.5 text-terracotta" />
				<span>Filosofi &amp; Warisan</span>
			</div>
			<h1 class="font-serif text-4xl sm:text-6xl lg:text-7xl text-stone-warm font-bold mb-6 leading-tight tracking-tight">
				The Soul of Wood
			</h1>
			<p class="text-stone-warm/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-sans font-light">
				Keunggulan struktural berpadu dengan keindahan estetika abadi. Setiap goresan pahat menceritakan dedikasi tanpa kompromi para empu pengrajin kayu.
			</p>
		</div>
	</section>

	<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<Breadcrumb items={breadcrumbItems} />
	</div>

	<!-- ═══════════════ KURASI MATERIAL ═══════════════ -->
	<section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
			<div class="lg:col-span-6 space-y-6">
				<div>
					<span class="text-xs tracking-[0.25em] uppercase text-terracotta font-semibold block mb-2">
						KURASI MATERIAL
					</span>
					<h2 class="font-serif text-3xl sm:text-4xl font-bold text-espresso leading-tight">
						Kayu Jati Solid Pilihan Berkelanjutan
					</h2>
				</div>

				<p class="text-espresso/70 text-sm sm:text-base leading-relaxed">
					Kami hanya memilih kayu jati perhutani tua pilihan yang telah melalui proses pengeringan alami (<span class="font-medium text-espresso">kiln-dry chamber</span>) selama berminggu-minggu. Kepadatan serat dan kadar minyak alaminya menjamin ketahanan terhadap perubahan cuaca tropis ekstrem tanpa risiko melengkung atau retak.
				</p>

				<div class="grid grid-cols-2 gap-4 pt-2">
					<div class="bg-white border border-border rounded-xl p-5 shadow-xs transition-transform hover:-translate-y-0.5">
						<p class="font-serif text-3xl font-bold text-terracotta mb-1">30+ Thn</p>
						<p class="text-xs font-semibold text-espresso mb-1">Pohon Jati Perhutani</p>
						<p class="text-[11px] text-muted-foreground leading-snug">
							Usia minimal pemanenan pohon jati legal untuk kerapatan serat tertinggi.
						</p>
					</div>
					<div class="bg-white border border-border rounded-xl p-5 shadow-xs transition-transform hover:-translate-y-0.5">
						<p class="font-serif text-3xl font-bold text-terracotta mb-1">8-10%</p>
						<p class="text-xs font-semibold text-espresso mb-1">Kadar Air Optimal</p>
						<p class="text-[11px] text-muted-foreground leading-snug">
							Standar kiln-dry kiln-chamber industri internasional untuk stabilitas dimensi.
						</p>
					</div>
					<div class="bg-white border border-border rounded-xl p-5 shadow-xs transition-transform hover:-translate-y-0.5">
						<div class="flex items-center gap-1.5 mb-1">
							<Shield class="w-4 h-4 text-terracotta" />
							<p class="font-serif text-xl font-bold text-espresso">100% Legal</p>
						</div>
						<p class="text-xs font-semibold text-espresso mb-1">Sertifikasi SVLK &amp; FSC</p>
						<p class="text-[11px] text-muted-foreground leading-snug">
							Berasal dari hutan tanam terbarukan yang diawasi kelestariannya.
						</p>
					</div>
					<div class="bg-white border border-border rounded-xl p-5 shadow-xs transition-transform hover:-translate-y-0.5">
						<div class="flex items-center gap-1.5 mb-1">
							<Droplets class="w-4 h-4 text-terracotta" />
							<p class="font-serif text-xl font-bold text-espresso">Zero VOC</p>
						</div>
						<p class="text-xs font-semibold text-espresso mb-1">Bebas Racun Kimia</p>
						<p class="text-[11px] text-muted-foreground leading-snug">
							Aman untuk bayi, hewan peliharaan, dan menjaga kualitas udara rumah.
						</p>
					</div>
				</div>
			</div>

			<div class="lg:col-span-6 relative">
				<div class="relative rounded-2xl overflow-hidden shadow-xl border border-border group">
					<img
						src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1000&q=85"
						alt="Tekstur serat kayu jati close-up Maison Lumina"
						class="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent"></div>
					<div class="absolute bottom-6 left-6 right-6 text-stone-warm">
						<p class="text-xs uppercase tracking-widest text-terracotta font-semibold mb-1">Ciri Khas Keaslian</p>
						<p class="font-serif text-lg font-bold">Pola Alur Lingkaran Kambium Alami</p>
						<p class="text-xs text-stone-warm/80 mt-1">Setiap furnitur memiliki corak unik yang tidak akan pernah sama satu sama lain di seluruh dunia.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════ TEKNIK KONSTRUKSI ═══════════════ -->
	<section class="bg-sand/40 border-y border-border py-16 lg:py-24">
		<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<span class="text-xs tracking-[0.25em] uppercase text-terracotta font-semibold block mb-2">
					TEKNIK KONSTRUKSI
				</span>
				<h2 class="font-serif text-3xl sm:text-4xl font-bold text-espresso mb-4">
					Sambungan Mortise &amp; Tenon Abadi
				</h2>
				<p class="text-sm text-espresso/70 leading-relaxed">
					Metode purba pertukangan kayu tingkat tinggi tanpa paku logam, menciptakan ikatan struktural yang justru semakin menyatu dan kokoh seiring perubahan waktu.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="bg-white rounded-2xl p-8 border border-border shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
					<div class="w-14 h-14 rounded-xl bg-sand flex items-center justify-center mb-6 group-hover:bg-terracotta transition-colors">
						<Hammer class="w-7 h-7 text-terracotta group-hover:text-white transition-colors" />
					</div>
					<h3 class="font-serif text-lg font-bold text-espresso mb-3">Presisi Lubang &amp; Purus</h3>
					<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						Sambungan lidah dan lubang kayu dipahat presisi dengan toleransi milimeter. Saat kayu menyerap suhu ruangan, sambungan saling mengunci secara harmonis tanpa berdecit.
					</p>
				</div>

				<div class="bg-white rounded-2xl p-8 border border-border shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
					<div class="w-14 h-14 rounded-xl bg-sand flex items-center justify-center mb-6 group-hover:bg-terracotta transition-colors">
						<Shield class="w-7 h-7 text-terracotta group-hover:text-white transition-colors" />
					</div>
					<h3 class="font-serif text-lg font-bold text-espresso mb-3">Perekat Resin Organik Nabati</h3>
					<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						Kami menghindari lem sintetis formaldehida. Resin organik nabati yang kami gunakan memiliki daya rekat elastis yang tahan terhadap kelembaban udara Indonesia.
					</p>
				</div>

				<div class="bg-white rounded-2xl p-8 border border-border shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
					<div class="w-14 h-14 rounded-xl bg-sand flex items-center justify-center mb-6 group-hover:bg-terracotta transition-colors">
						<Award class="w-7 h-7 text-terracotta group-hover:text-white transition-colors" />
					</div>
					<h3 class="font-serif text-lg font-bold text-espresso mb-3">Uji Beban Dinamis 200+ Kg</h3>
					<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						Setiap prototipe kursi dan ranjang melewati simulasi uji kelelahan struktur hingga 50.000 siklus penekanan beban untuk menjamin ketahanan pakai puluhan tahun.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════ FINISHING NATURAL ═══════════════ -->
	<section class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
			<div class="lg:col-span-6 order-2 lg:order-1 relative">
				<div class="rounded-2xl overflow-hidden shadow-xl border border-border group">
					<img
						src="https://images.unsplash.com/photo-1622201426167-3ae49d0a5a63?w=1000&q=85"
						alt="Pengrajin melakukan finishing manual pada kayu"
						class="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
					/>
				</div>
			</div>

			<div class="lg:col-span-6 order-1 lg:order-2 space-y-6">
				<div>
					<span class="text-xs tracking-[0.25em] uppercase text-terracotta font-semibold block mb-2">
						FINISHING NATURAL
					</span>
					<h2 class="font-serif text-3xl sm:text-4xl font-bold text-espresso leading-tight">
						Sentuhan Tangan yang Menghidupkan Jiwa Serat
					</h2>
				</div>

				<p class="text-espresso/70 text-sm sm:text-base leading-relaxed">
					Kami percaya furnitur terbaik tidak menutupi keindahan alaminya dengan lapisan pernis tebal seperti plastik. Sebaliknya, kami menggunakan minyak nabati murni (linseed oil) dan lilin lebah liar (pure beeswax) yang menyerap ke dalam pori-pori kayu.
				</p>

				<div class="space-y-3 pt-2">
					<div class="flex items-start gap-3">
						<div class="mt-0.5 w-5 h-5 rounded-full bg-terracotta/15 flex items-center justify-center flex-shrink-0 text-terracotta">
							<CheckCircle2 class="w-4 h-4" />
						</div>
						<div>
							<p class="text-sm font-semibold text-espresso">Permukaan Bernapas (Breathable Surface)</p>
							<p class="text-xs text-muted-foreground">Kayu tetap dapat bernapas secara alami, menolak noda tumpahan cairan kopi atau teh ringan.</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<div class="mt-0.5 w-5 h-5 rounded-full bg-terracotta/15 flex items-center justify-center flex-shrink-0 text-terracotta">
							<CheckCircle2 class="w-4 h-4" />
						</div>
						<div>
							<p class="text-sm font-semibold text-espresso">Tekstur Hangat dan Halus Seperti Beludru</p>
							<p class="text-xs text-muted-foreground">Saat jari Anda menyentuh permukaan, Anda merasakan kehangatan serat kayu asli, bukan lapisan akrilik dingin.</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<div class="mt-0.5 w-5 h-5 rounded-full bg-terracotta/15 flex items-center justify-center flex-shrink-0 text-terracotta">
							<CheckCircle2 class="w-4 h-4" />
						</div>
						<div>
							<p class="text-sm font-semibold text-espresso">Kemudahan Perawatan &amp; Restorasi Mandiri</p>
							<p class="text-xs text-muted-foreground">Cukup usap sedikit wood-butter setiap tahun untuk mengembalikan kilau keemasan alami tanpa perlu tukang cat ulang.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════ GALERI WORKSHOP ═══════════════ -->
	<section class="bg-sand/30 py-16 lg:py-24 border-t border-border">
		<div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-2xl mx-auto mb-16">
				<span class="text-xs tracking-[0.25em] uppercase text-terracotta font-semibold block mb-2">
					WORKSHOP KAMI
				</span>
				<h2 class="font-serif text-3xl sm:text-4xl font-bold text-espresso mb-4">
					Galeri Empu Pengrajin Jepara
				</h2>
				<p class="text-sm text-espresso/70 leading-relaxed">
					Saksikan bagaimana tangan-tangan maestro mengubah balok kayu mentah menjadi mahakarya fungsional yang mengisi kenyamanan rumah Anda.
				</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{#each workshopPhotos as item}
					<div class="bg-white rounded-2xl overflow-hidden border border-border shadow-xs group flex flex-col">
						<div class="relative h-60 overflow-hidden bg-espresso">
							<img
								src={item.src}
								alt={item.title}
								class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
							/>
							<div class="absolute top-3 left-3 px-2.5 py-1 bg-espresso/80 backdrop-blur-md rounded-md text-stone-warm text-[10px] font-bold tracking-wider uppercase">
								Tahap {item.step}
							</div>
						</div>
						<div class="p-5 flex-1 flex flex-col justify-between">
							<div>
								<h3 class="font-serif text-base font-bold text-espresso mb-2">{item.title}</h3>
								<p class="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- CTA Actions -->
			<div class="mt-16 bg-espresso rounded-3xl p-8 sm:p-12 text-center text-stone-warm relative overflow-hidden shadow-2xl">
				<div class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-terracotta/20 blur-3xl pointer-events-none"></div>
				<div class="relative z-10 max-w-2xl mx-auto space-y-6">
					<p class="text-xs tracking-[0.25em] uppercase text-terracotta font-semibold">MAHAKARYA UNTUK KEDIAMAN ANDA</p>
					<h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-stone-warm">
						Rasakan Sentuhan Kualitas Kayu Asli
					</h2>
					<p class="text-sm sm:text-base text-stone-warm/75 max-w-xl mx-auto font-light leading-relaxed">
						Setiap furnitur Maison Lumina dirancang untuk bertahan melewati generasi. Jelajahi katalog butik kami atau simulasikan tata letak denah ruangan Anda secara virtual.
					</p>

					<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
						<a
							href="/produk"
							class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-terracotta text-white font-medium text-sm rounded-xl hover:bg-terracotta-hover transition-colors shadow-sm"
						>
							<span>Jelajahi Koleksi Produk</span>
							<ArrowRight class="w-4 h-4" />
						</a>
						<a
							href="/room-planner"
							class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-stone-warm font-medium text-sm rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
						>
							<LayoutGrid class="w-4 h-4 text-terracotta" />
							<span>Studio Ruang Virtual</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
