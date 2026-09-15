<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';

	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import User from '@lucide/svelte/icons/user';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	let mode = $state<'login' | 'register'>('login');

	// Form fields
	let loginEmail = $state('dian.sastro@example.com');
	let loginPassword = $state('password123');

	let regName = $state('');
	let regEmail = $state('');
	let regPassword = $state('');
	let regConfirmPassword = $state('');

	// State
	let isLoading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	let redirectUrl = $derived($page.url.searchParams.get('redirect') || '/akun');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		isLoading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: loginEmail,
					password: loginPassword
				})
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Gagal masuk');
			}

			goto(redirectUrl);
		} catch (err: any) {
			errorMessage = err.message || 'Terjadi kesalahan saat masuk';
		} finally {
			isLoading = false;
		}
	}

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';

		if (regPassword !== regConfirmPassword) {
			errorMessage = 'Konfirmasi kata sandi tidak cocok.';
			return;
		}

		isLoading = true;

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: regName,
					email: regEmail,
					password: regPassword
				})
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Pendaftaran gagal');
			}

			goto(redirectUrl);
		} catch (err: any) {
			errorMessage = err.message || 'Terjadi kesalahan saat mendaftar';
		} finally {
			isLoading = false;
		}
	}

	function handleDemoLogin() {
		loginEmail = 'dian.sastro@example.com';
		loginPassword = 'password123';
		const form = document.getElementById('login-form') as HTMLFormElement;
		if (form) form.requestSubmit();
	}
</script>

<svelte:head>
	<title>{mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'} | Maison Lumina</title>
	<meta name="description" content="Masuk atau daftarkan akun Anda di Maison Lumina Atelier & Mebel." />
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-12">
	<div class="mx-auto max-w-md px-4 sm:px-6">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<Breadcrumb
				items={[
					{ label: 'Beranda', href: '/' },
					{ label: mode === 'login' ? 'Masuk Akun' : 'Daftar Akun' }
				]}
			/>
		</div>

		<!-- Main Card Container -->
		<div class="overflow-hidden rounded-3xl border border-[#E8DFD0] bg-white p-7 sm:p-9 shadow-sm">
			<!-- Header Monogram -->
			<div class="text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1810] text-[#F7F3EC] font-serif text-lg font-bold shadow-sm">
					ML
				</div>
				<h1 class="mt-4 font-serif text-2xl font-bold text-[#1F1810] sm:text-3xl">
					{mode === 'login' ? 'Selamat Datang Kembali' : 'Bergabung Bersama Kami'}
				</h1>
				<p class="mt-1.5 text-xs text-stone-600">
					{mode === 'login'
						? 'Masuk untuk mengelola pesanan & preferensi hunian Anda.'
						: 'Daftarkan diri Anda untuk menikmati kurasi furnitur eksklusif.'}
				</p>
			</div>

			<!-- Tab Switcher -->
			<div class="mt-6 grid grid-cols-2 rounded-xl bg-[#F7F3EC] p-1 border border-[#E8DFD0]/60">
				<button
					type="button"
					onclick={() => {
						mode = 'login';
						errorMessage = '';
					}}
					class="rounded-lg py-2 text-xs font-semibold transition-all {mode === 'login' ? 'bg-white text-[#1F1810] shadow-xs' : 'text-stone-600 hover:text-[#1F1810]'}"
				>
					Masuk (Login)
				</button>
				<button
					type="button"
					onclick={() => {
						mode = 'register';
						errorMessage = '';
					}}
					class="rounded-lg py-2 text-xs font-semibold transition-all {mode === 'register' ? 'bg-white text-[#1F1810] shadow-xs' : 'text-stone-600 hover:text-[#1F1810]'}"
				>
					Daftar Akun
				</button>
			</div>

			<!-- Error / Success Alert -->
			{#if errorMessage}
				<div class="mt-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
					<AlertCircle class="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
					<span>{errorMessage}</span>
				</div>
			{/if}

			{#if mode === 'login'}
				<!-- Login Form -->
				<form id="login-form" onsubmit={handleLogin} class="mt-6 space-y-4">
					<div>
						<label for="login-email" class="block text-xs font-medium text-stone-700 mb-1">
							Alamat Email
						</label>
						<div class="relative">
							<input
								id="login-email"
								type="email"
								required
								bind:value={loginEmail}
								placeholder="nama@domain.com"
								class="w-full rounded-xl border border-[#E8DFD0] pl-10 pr-3 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
							/>
							<Mail class="h-4 w-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
						</div>
					</div>

					<div>
						<div class="flex items-center justify-between mb-1">
							<label for="login-password" class="text-xs font-medium text-stone-700">
								Kata Sandi
							</label>
						</div>
						<div class="relative">
							<input
								id="login-password"
								type="password"
								required
								bind:value={loginPassword}
								placeholder="••••••••"
								class="w-full rounded-xl border border-[#E8DFD0] pl-10 pr-3 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
							/>
							<Lock class="h-4 w-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F1810] py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#B5652F] active:scale-[0.98] disabled:opacity-50"
					>
						{#if isLoading}
							<Loader2 class="h-4 w-4 animate-spin text-white" />
							<span>Memproses Masuk...</span>
						{:else}
							<span>Masuk ke Akun</span>
							<ArrowRight class="h-3.5 w-3.5" />
						{/if}
					</button>

					<!-- Demo Quick Login Helper -->
					<div class="pt-4 border-t border-[#E8DFD0]/60">
						<button
							type="button"
							onclick={handleDemoLogin}
							class="flex w-full items-center justify-center gap-2 rounded-xl border border-[#B5652F]/40 bg-[#B5652F]/5 py-2.5 text-xs font-semibold text-[#B5652F] hover:bg-[#B5652F]/10 transition-colors"
						>
							<Sparkles class="h-3.5 w-3.5" />
							<span>Masuk Cepat Demo VIP (Dian Sastrowardoyo)</span>
						</button>
					</div>
				</form>
			{:else}
				<!-- Register Form -->
				<form onsubmit={handleRegister} class="mt-6 space-y-4">
					<div>
						<label for="reg-name" class="block text-xs font-medium text-stone-700 mb-1">
							Nama Lengkap *
						</label>
						<div class="relative">
							<input
								id="reg-name"
								type="text"
								required
								bind:value={regName}
								placeholder="Contoh: Dian Sastrowardoyo"
								class="w-full rounded-xl border border-[#E8DFD0] pl-10 pr-3 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
							/>
							<User class="h-4 w-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
						</div>
					</div>

					<div>
						<label for="reg-email" class="block text-xs font-medium text-stone-700 mb-1">
							Alamat Email *
						</label>
						<div class="relative">
							<input
								id="reg-email"
								type="email"
								required
								bind:value={regEmail}
								placeholder="nama@domain.com"
								class="w-full rounded-xl border border-[#E8DFD0] pl-10 pr-3 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
							/>
							<Mail class="h-4 w-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
						</div>
					</div>

					<div>
						<label for="reg-password" class="block text-xs font-medium text-stone-700 mb-1">
							Kata Sandi (Min. 6 Karakter) *
						</label>
						<div class="relative">
							<input
								id="reg-password"
								type="password"
								required
								minlength="6"
								bind:value={regPassword}
								placeholder="••••••••"
								class="w-full rounded-xl border border-[#E8DFD0] pl-10 pr-3 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
							/>
							<Lock class="h-4 w-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
						</div>
					</div>

					<div>
						<label for="reg-confirm-password" class="block text-xs font-medium text-stone-700 mb-1">
							Konfirmasi Kata Sandi *
						</label>
						<div class="relative">
							<input
								id="reg-confirm-password"
								type="password"
								required
								minlength="6"
								bind:value={regConfirmPassword}
								placeholder="••••••••"
								class="w-full rounded-xl border border-[#E8DFD0] pl-10 pr-3 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
							/>
							<Lock class="h-4 w-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5652F] py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#9E5424] active:scale-[0.98] disabled:opacity-50"
					>
						{#if isLoading}
							<Loader2 class="h-4 w-4 animate-spin text-white" />
							<span>Mendaftarkan Akun...</span>
						{:else}
							<span>Daftar Akun Baru</span>
							<ArrowRight class="h-3.5 w-3.5" />
						{/if}
					</button>
				</form>
			{/if}
		</div>
	</div>
</div>
