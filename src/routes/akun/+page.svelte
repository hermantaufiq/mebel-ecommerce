<script lang="ts">
	import type { PageData } from './$types';
	import { formatRupiah, formatDateId } from '$lib/utils';
	import Breadcrumb from '$lib/components/ui/breadcrumb/Breadcrumb.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { goto, invalidateAll } from '$app/navigation';
	import { cartStore } from '$lib/stores/cart.svelte';
	import {
		TIER_METADATA,
		isTierEligible,
		getNextTierInfo,
		type TierName
	} from '$lib/tier-config';

	import Package from '@lucide/svelte/icons/package';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Clock from '@lucide/svelte/icons/clock';
	import Phone from '@lucide/svelte/icons/phone';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Wrench from '@lucide/svelte/icons/wrench';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Check from '@lucide/svelte/icons/check';
	import Gift from '@lucide/svelte/icons/gift';
	import Ticket from '@lucide/svelte/icons/ticket';
	import Copy from '@lucide/svelte/icons/copy';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Truck from '@lucide/svelte/icons/truck';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Award from '@lucide/svelte/icons/award';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Settings from '@lucide/svelte/icons/settings';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Lock from '@lucide/svelte/icons/lock';
	import UserIcon from '@lucide/svelte/icons/user';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import X from '@lucide/svelte/icons/x';
	import { getPasswordStrength, PASSWORD_MIN_LENGTH } from '$lib/schemas/auth';

	let { data }: { data: PageData } = $props();

	// Derived reactive state directly bound to server load data
	let user = $derived(data.user);
	let orders = $derived(data.orders || []);
	let rewards = $derived(data.rewards || []);
	let redemptions = $derived(data.redemptions || []);
	let addresses = $derived(data.addresses || []);

	// Active navigation tab
	let activeTab = $state<'orders' | 'rewards' | 'my-rewards' | 'addresses' | 'profile' | 'concierge'>('orders');

	// Reward category filter
	let selectedCategory = $state<string>('all');

	// Feedback and modal state
	let reorderSuccessMsg = $state('');
	let actionFeedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let copiedCode = $state<string | null>(null);

	// Confirmation modal for redemption
	let rewardToRedeem = $state<any | null>(null);
	let isRedeeming = $state(false);

	// Order completion loading
	let completingOrderId = $state<string | null>(null);

	// Derived tier calculations
	let currentTier = $derived((user.tier || 'Regular') as TierName);
	let tierMeta = $derived(TIER_METADATA[currentTier] || TIER_METADATA.Regular);
	let tierProgress = $derived(getNextTierInfo(user.totalSpending || 0));

	// Filtered rewards
	let filteredRewards = $derived(
		selectedCategory === 'all' ? rewards : rewards.filter((r) => r.category === selectedCategory)
	);

	function showFeedback(type: 'success' | 'error', message: string, duration = 4000) {
		actionFeedback = { type, message };
		setTimeout(() => {
			if (actionFeedback?.message === message) {
				actionFeedback = null;
			}
		}, duration);
	}

	function handleReorderItem(item: any) {
		cartStore.addItem({
			productId: item.productId,
			variantId: item.variantId || null,
			name: item.product?.name || 'Item Furnitur',
			unitPrice: item.product?.price || item.priceAtOrder,
			image: item.product?.images?.[0]?.url || '',
			variantLabel: item.variantLabel || undefined,
			qty: item.qty || 1,
			maxStock: 99,
			slug: item.product?.slug
		});
		reorderSuccessMsg = `"${item.product?.name || 'Item'}" berhasil ditambahkan ke keranjang belanja.`;
		setTimeout(() => {
			reorderSuccessMsg = '';
		}, 3500);
	}

	function handleReorderAll(order: any) {
		const itemsToAdd = order.items.map((item: any) => ({
			productId: item.productId,
			variantId: item.variantId || null,
			name: item.product?.name || 'Item Furnitur',
			unitPrice: item.product?.price || item.priceAtOrder,
			image: item.product?.images?.[0]?.url || '',
			variantLabel: item.variantLabel || undefined,
			qty: item.qty || 1,
			maxStock: 99,
			slug: item.product?.slug
		}));
		cartStore.addMultipleItems(itemsToAdd);
		goto('/keranjang');
	}

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			goto('/login');
		} catch (err) {
			console.error('Logout error:', err);
		}
	}

	// Copy voucher code
	async function copyToClipboard(code: string) {
		try {
			await navigator.clipboard.writeText(code);
			copiedCode = code;
			setTimeout(() => {
				if (copiedCode === code) copiedCode = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy', err);
		}
	}

	// Confirm order completion
	async function handleCompleteOrder(order: any) {
		if (completingOrderId) return;
		const confirmAction = confirm(
			`Konfirmasi bahwa Anda telah menerima pesanan #${order.orderNumber} dengan baik? Status pesanan akan diubah menjadi Selesai dan Anda akan memperoleh poin loyalitas.`
		);
		if (!confirmAction) return;

		completingOrderId = order.id;
		try {
			const res = await fetch(`/api/orders/${order.id}/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await res.json();

			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal mengonfirmasi penerimaan pesanan');
				return;
			}

			// Invalidate all page data so fresh user, points, and orders are fetched
			await invalidateAll();

			showFeedback(
				'success',
				`Pesanan #${order.orderNumber} selesai! Anda mendapatkan +${result.result?.pointsAwarded ?? 0} poin loyalitas.`
			);
		} catch (err: any) {
			console.error('Error completing order:', err);
			showFeedback('error', 'Terjadi kesalahan sistem saat memproses pesanan.');
		} finally {
			completingOrderId = null;
		}
	}

	// Open redemption confirmation modal
	function openRedeemModal(reward: any) {
		rewardToRedeem = reward;
	}

	// Execute reward redemption
	async function handleRedeemReward() {
		if (!rewardToRedeem || isRedeeming) return;

		isRedeeming = true;
		try {
			const res = await fetch('/api/rewards/redeem', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rewardId: rewardToRedeem.id })
			});
			const result = await res.json();

			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal menukarkan reward');
				rewardToRedeem = null;
				return;
			}

			const redeemedName = rewardToRedeem.name;
			const code = result.redemption?.voucherCode;
			rewardToRedeem = null;

			// Invalidate all page data so fresh user points and redemptions list are loaded
			await invalidateAll();

			showFeedback(
				'success',
				`Selamat! Reward "${redeemedName}" berhasil ditukarkan.${code ? ` Kode voucher: ${code}` : ''}`
			);

			// Automatically switch to 'my-rewards' tab so user sees their new perk
			activeTab = 'my-rewards';
		} catch (err: any) {
			console.error('Redemption error:', err);
			showFeedback('error', 'Terjadi kesalahan saat memproses penukaran reward.');
		} finally {
			isRedeeming = false;
		}
	}

	function getCategoryBadgeClass(category: string) {
		switch (category) {
			case 'voucher':
				return 'bg-emerald-50 text-emerald-800 border-emerald-200';
			case 'layanan':
				return 'bg-purple-50 text-purple-800 border-purple-200';
			case 'garansi':
				return 'bg-amber-50 text-amber-800 border-amber-200';
			case 'pengiriman':
				return 'bg-blue-50 text-blue-800 border-blue-200';
			default:
				return 'bg-stone-100 text-stone-700 border-stone-200';
		}
	}

	function getTierBadgeClass(tier: string) {
		switch (tier) {
			case 'Platinum':
				return 'bg-stone-900 text-amber-300 border-stone-800 shadow-xs';
			case 'Gold':
				return 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs';
			case 'Silver':
				return 'bg-slate-200 text-slate-800 border-slate-300 shadow-2xs';
			default:
				return 'bg-stone-100 text-stone-700 border-stone-300';
		}
	}

	// Profile management state
	// svelte-ignore state_referenced_locally
	let editName = $state(data.user.name || '');
	let isSavingProfile = $state(false);

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let isChangingPassword = $state(false);

	let newPwStrength = $derived(getPasswordStrength(newPassword));
	let isNewPasswordValid = $derived(newPassword.length >= PASSWORD_MIN_LENGTH);
	let isChangePasswordReady = $derived(
		isNewPasswordValid && newPassword === confirmNewPassword && currentPassword.length > 0
	);

	// Address CRUD modal & state
	let showAddressModal = $state(false);
	let editingAddressId = $state<string | null>(null);
	let addressForm = $state({
		recipient: '',
		phone: '',
		fullAddress: '',
		notes: '',
		isDefault: false
	});
	let isSavingAddress = $state(false);
	let deletingAddressId = $state<string | null>(null);

	async function handleUpdateProfile(e: SubmitEvent) {
		e.preventDefault();
		if (!editName.trim()) return;
		isSavingProfile = true;
		try {
			const res = await fetch('/api/auth/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editName.trim() })
			});
			const result = await res.json();
			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal memperbarui profil');
			} else {
				showFeedback('success', 'Nama profil berhasil diperbarui');
				await invalidateAll();
			}
		} catch {
			showFeedback('error', 'Terjadi kesalahan koneksi saat memperbarui profil');
		} finally {
			isSavingProfile = false;
		}
	}

	async function handleChangePassword(e: SubmitEvent) {
		e.preventDefault();
		if (!isChangePasswordReady) return;
		isChangingPassword = true;
		try {
			const res = await fetch('/api/auth/profile?action=change-password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword })
			});
			const result = await res.json();
			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal mengubah kata sandi');
			} else {
				showFeedback('success', 'Kata sandi berhasil diperbarui');
				currentPassword = '';
				newPassword = '';
				confirmNewPassword = '';
			}
		} catch {
			showFeedback('error', 'Terjadi kesalahan saat mengubah kata sandi');
		} finally {
			isChangingPassword = false;
		}
	}

	function openAddAddressModal() {
		editingAddressId = null;
		addressForm = {
			recipient: user.name || '',
			phone: '',
			fullAddress: '',
			notes: '',
			isDefault: addresses.length === 0
		};
		showAddressModal = true;
	}

	function openEditAddressModal(addr: any) {
		editingAddressId = addr.id;
		addressForm = {
			recipient: addr.recipient,
			phone: addr.phone,
			fullAddress: addr.fullAddress,
			notes: addr.notes || '',
			isDefault: addr.isDefault
		};
		showAddressModal = true;
	}

	async function handleSaveAddress(e: SubmitEvent) {
		e.preventDefault();
		isSavingAddress = true;
		try {
			const isEdit = !!editingAddressId;
			const res = await fetch('/api/addresses', {
				method: isEdit ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(isEdit ? { id: editingAddressId, ...addressForm } : addressForm)
			});
			const result = await res.json();
			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal menyimpan alamat');
			} else {
				showFeedback('success', isEdit ? 'Alamat berhasil diperbarui' : 'Alamat baru berhasil ditambahkan');
				showAddressModal = false;
				await invalidateAll();
			}
		} catch {
			showFeedback('error', 'Terjadi kesalahan saat menyimpan alamat');
		} finally {
			isSavingAddress = false;
		}
	}

	async function handleSetDefaultAddress(addr: any) {
		if (addr.isDefault) return;
		try {
			const res = await fetch('/api/addresses', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: addr.id,
					recipient: addr.recipient,
					phone: addr.phone,
					fullAddress: addr.fullAddress,
					notes: addr.notes,
					isDefault: true
				})
			});
			const result = await res.json();
			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal mengubah alamat default');
			} else {
				showFeedback('success', 'Alamat utama berhasil diubah');
				await invalidateAll();
			}
		} catch {
			showFeedback('error', 'Terjadi kesalahan saat mengatur alamat utama');
		}
	}

	async function handleDeleteAddress(addressId: string) {
		if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
		deletingAddressId = addressId;
		try {
			const res = await fetch('/api/addresses', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: addressId })
			});
			const result = await res.json();
			if (!res.ok) {
				showFeedback('error', result.error || 'Gagal menghapus alamat');
			} else {
				showFeedback('success', 'Alamat berhasil dihapus');
				await invalidateAll();
			}
		} catch {
			showFeedback('error', 'Terjadi kesalahan saat menghapus alamat');
		} finally {
			deletingAddressId = null;
		}
	}
</script>

<svelte:head>
	<title>Akun Saya &amp; Tier Keanggotaan | Maison Lumina</title>
	<meta
		name="description"
		content="Kelola profil, tier membership, reward fungsional, dan pantau riwayat pesanan furnitur Anda di Maison Lumina."
	/>
</svelte:head>

<div class="min-h-screen bg-[#F7F3EC] py-6 sm:py-10">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<Breadcrumb
				items={[
					{ label: 'Beranda', href: '/' },
					{ label: 'Akun Saya' }
				]}
			/>
		</div>

		<!-- Action Toast Notification -->
		{#if actionFeedback}
			<div
				class="mb-6 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-xs shadow-sm transition-all {actionFeedback.type ===
				'success'
					? 'border-emerald-200 bg-emerald-50 text-emerald-900'
					: 'border-rose-200 bg-rose-50 text-rose-900'}"
			>
				<div class="flex items-center gap-2.5">
					{#if actionFeedback.type === 'success'}
						<CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
					{:else}
						<AlertCircle class="h-4 w-4 text-rose-600 shrink-0" />
					{/if}
					<span class="font-medium">{actionFeedback.message}</span>
				</div>
				<button
					type="button"
					onclick={() => (actionFeedback = null)}
					class="text-stone-400 hover:text-stone-600 font-bold px-1"
				>
					✕
				</button>
			</div>
		{/if}

		<!-- User Profile & Membership Card -->
		<div class="rounded-3xl border border-[#E8DFD0] bg-white p-5 sm:p-8 shadow-sm">
			<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<!-- Left Profile Info -->
				<div class="flex items-start gap-4 sm:gap-5">
					<div
						class="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#1F1810] text-[#F7F3EC] font-serif text-2xl sm:text-3xl font-bold shadow-md shrink-0 ring-4 ring-[#E8DFD0]/40"
					>
						{user.name
							.split(' ')
							.map((n: string) => n[0])
							.slice(0, 2)
							.join('')}
					</div>
					<div>
						<div class="flex flex-wrap items-center gap-2.5">
							<h1 class="font-serif text-xl sm:text-2xl font-bold text-[#1F1810]">
								{user.name}
							</h1>
							<span
								class="inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold {getTierBadgeClass(
									currentTier
								)}"
							>
								<Sparkles class="h-3 w-3 inline text-amber-500" />
								{tierMeta.label}
							</span>
						</div>
						<p class="text-xs text-stone-500 mt-1">
							{user.email} • Bergabung sejak {user.createdAt
								? new Date(user.createdAt).getFullYear()
								: 2024}
						</p>

						<!-- Perks summary pills -->
						<div class="mt-3 flex flex-wrap items-center gap-1.5">
							{#each tierMeta.perks as perk}
								<span
									class="inline-flex items-center gap-1 rounded-md bg-[#F7F3EC] border border-[#E8DFD0] px-2 py-0.5 text-[11px] text-stone-600 font-medium"
								>
									<Check class="h-2.5 w-2.5 text-[#B5652F]" />
									{perk}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right Metrics & Logout -->
				<div class="flex flex-wrap items-center gap-3 sm:gap-4 justify-between lg:justify-end">
					<div class="flex gap-3">
						<!-- Total Spending Metric -->
						<div class="rounded-2xl border border-[#E8DFD0] bg-[#F7F3EC]/70 px-4 py-3 min-w-[130px]">
							<span class="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">
								Total Belanja
							</span>
							<span class="font-serif text-base sm:text-lg font-bold text-[#1F1810]">
								{formatRupiah(user.totalSpending || 0)}
							</span>
						</div>

						<!-- Loyalty Points Metric -->
						<div class="rounded-2xl border border-[#E8DFD0] bg-[#F7F3EC]/70 px-4 py-3 min-w-[130px]">
							<span class="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">
								Poin Tersedia
							</span>
							<span class="font-serif text-base sm:text-lg font-bold text-[#B5652F]">
								{(user.loyaltyPoints || 0).toLocaleString('id-ID')} Poin
							</span>
						</div>
					</div>

					<button
						type="button"
						onclick={handleLogout}
						class="flex items-center gap-1.5 rounded-xl border border-[#E8DFD0] bg-white px-3.5 py-3 text-xs font-semibold text-stone-600 hover:border-rose-300 hover:text-rose-600 transition-colors shadow-2xs"
						title="Keluar dari akun"
					>
						<LogOut class="h-4 w-4" />
						<span class="hidden sm:inline">Keluar</span>
					</button>
				</div>
			</div>

			<!-- Tier Progress Bar Section -->
			<div class="mt-6 rounded-2xl border border-[#E8DFD0] bg-[#FAF8F5] p-4 sm:p-5">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
					<div class="flex items-center gap-2">
						<Award class="h-4 w-4 text-[#B5652F]" />
						<span class="font-semibold text-[#1F1810]">
							Status Membership: <strong class="text-[#B5652F]">{tierMeta.label}</strong>
						</span>
					</div>
					<span class="text-stone-500 text-[11px] sm:text-xs">
						{#if tierProgress.nextTier}
							Butuh belanja <strong>{formatRupiah(tierProgress.neededAmount)}</strong> lagi untuk naik ke
							<strong class="text-[#1F1810]">Maison {tierProgress.nextTier}</strong>
						{:else}
							<span class="text-emerald-700 font-semibold">
								★ Anda telah mencapai tingkat keanggotaan tertinggi Maison Platinum
							</span>
						{/if}
					</span>
				</div>

				<!-- Progress track -->
				<div class="mt-3 relative">
					<div class="h-2.5 w-full overflow-hidden rounded-full bg-[#E8DFD0]/60">
						<div
							class="h-full rounded-full bg-gradient-to-r from-[#B5652F] to-[#D4AF37] transition-all duration-500 ease-out"
							style="width: {tierProgress.progressPercent}%"
						></div>
					</div>

					<!-- Tier Milestones Labels -->
					<div class="mt-2 flex justify-between text-[10px] sm:text-[11px] text-stone-500 font-medium">
						<span class={currentTier === 'Regular' ? 'font-bold text-[#1F1810]' : ''}>Regular (Rp 0)</span>
						<span class={currentTier === 'Silver' ? 'font-bold text-[#1F1810]' : ''}>Silver (Rp 10jt)</span>
						<span class={currentTier === 'Gold' ? 'font-bold text-[#1F1810]' : ''}>Gold (Rp 50jt)</span>
						<span class={currentTier === 'Platinum' ? 'font-bold text-[#1F1810]' : ''}>Platinum (Rp 150jt)</span>
					</div>
				</div>
			</div>

			<!-- Navigation Tabs -->
			<div
				class="mt-6 sm:mt-8 flex gap-2 border-t border-[#E8DFD0] pt-4 overflow-x-auto scrollbar-none flex-nowrap pb-1"
			>
				<button
					type="button"
					onclick={() => (activeTab = 'orders')}
					class="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all {activeTab ===
					'orders'
						? 'bg-[#1F1810] text-white shadow-sm'
						: 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Package class="h-4 w-4" />
					<span>Riwayat Pesanan ({orders.length})</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'rewards')}
					class="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all {activeTab ===
					'rewards'
						? 'bg-[#1F1810] text-white shadow-sm'
						: 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Gift class="h-4 w-4" />
					<span>Katalog Reward ({rewards.length})</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'my-rewards')}
					class="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all {activeTab ===
					'my-rewards'
						? 'bg-[#1F1810] text-white shadow-sm'
						: 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Ticket class="h-4 w-4" />
					<span>Reward Saya ({redemptions.length})</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'addresses')}
					class="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all {activeTab ===
					'addresses'
						? 'bg-[#1F1810] text-white shadow-sm'
						: 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<MapPin class="h-4 w-4" />
					<span>Buku Alamat ({addresses.length})</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'profile')}
					class="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all {activeTab ===
					'profile'
						? 'bg-[#1F1810] text-white shadow-sm'
						: 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Settings class="h-4 w-4" />
					<span>Profil &amp; Keamanan</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'concierge')}
					class="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all {activeTab ===
					'concierge'
						? 'bg-[#1F1810] text-white shadow-sm'
						: 'text-stone-600 hover:bg-[#F7F3EC]'}"
				>
					<Phone class="h-4 w-4" />
					<span>Concierge Atelier</span>
				</button>
			</div>
		</div>

		<!-- Tab Contents -->
		<div class="mt-8">
			<!-- TAB 1: RIWAYAT PESANAN -->
			{#if activeTab === 'orders'}
				<!-- Reorder Toast Notification -->
				{#if reorderSuccessMsg}
					<div
						class="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2"
					>
						<div class="flex items-center gap-2">
							<Check class="h-4 w-4 text-emerald-600 shrink-0" />
							<span>{reorderSuccessMsg}</span>
						</div>
						<a
							href="/keranjang"
							class="font-semibold text-emerald-700 underline hover:text-emerald-900 shrink-0"
						>
							Buka Keranjang &rarr;
						</a>
					</div>
				{/if}

				<!-- Orders List -->
				{#if orders.length === 0}
					<div class="rounded-3xl border border-[#E8DFD0] bg-white px-6 py-16 text-center shadow-sm">
						<Package class="mx-auto h-12 w-12 text-stone-400" />
						<h2 class="mt-4 font-serif text-xl font-bold text-[#1F1810]">
							Belum Ada Riwayat Pesanan
						</h2>
						<p class="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
							Anda belum memiliki transaksi pesanan di Maison Lumina. Mulai jelajahi karya furnitur
							terbaik kami.
						</p>
						<a
							href="/produk"
							class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B5652F] transition-colors"
						>
							<span>Mulai Belanja</span>
							<ArrowRight class="h-3.5 w-3.5" />
						</a>
					</div>
				{:else}
					<div class="space-y-6">
						{#each orders as order}
							<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm">
								<!-- Order Header Bar -->
								<div
									class="flex flex-col gap-3 border-b border-[#E8DFD0] pb-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="flex items-center gap-3">
										<div>
											<span
												class="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block"
											>
												Nomor Pesanan
											</span>
											<span class="font-serif text-base font-bold text-[#1F1810]">
												{order.orderNumber}
											</span>
										</div>
										<Badge
											class={order.status === 'Selesai'
												? 'bg-emerald-100 text-emerald-800'
												: order.status === 'Dikirim'
													? 'bg-blue-100 text-blue-800'
													: 'bg-amber-100 text-amber-800'}
										>
											{order.status}
										</Badge>
										{#if order.loyaltyProcessed}
											<span
												class="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
											>
												<CheckCircle2 class="h-3 w-3 text-emerald-600" />
												Poin Terproses
											</span>
										{/if}
									</div>

									<div class="flex items-center gap-4 text-xs text-stone-600">
										<div class="flex items-center gap-1">
											<Clock class="h-3.5 w-3.5 text-stone-400" />
											<span>{order.createdAt ? formatDateId(order.createdAt) : ''}</span>
										</div>
										<span class="font-serif text-base font-bold text-[#1F1810]">
											{formatRupiah(order.total)}
										</span>
									</div>
								</div>

								<!-- Items Preview List -->
								<div class="divide-y divide-[#E8DFD0]/60 py-2">
									{#each order.items as item}
										<div
											class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3"
										>
											<div class="flex items-center gap-3">
												{#if item.product?.images?.[0]?.url}
													<img
														src={item.product.images[0].url}
														alt={item.product.name}
														class="h-12 w-14 rounded-md object-cover border border-[#E8DFD0] bg-[#EDE4D7] shrink-0"
													/>
												{/if}
												<div>
													<span class="font-serif text-xs font-semibold text-[#1F1810] block">
														{item.product?.name || 'Item Furnitur'}
													</span>
													{#if item.variantLabel}
														<span class="text-[11px] text-[#B5652F] font-medium block">
															Varian: {item.variantLabel}
														</span>
													{/if}
													<span class="text-[11px] text-stone-500">
														{item.qty} unit × {formatRupiah(item.priceAtOrder)}
													</span>
												</div>
											</div>

											<div
												class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-dashed border-[#E8DFD0]/60 sm:border-0"
											>
												<span class="font-serif text-xs font-bold text-[#1F1810]">
													{formatRupiah(item.priceAtOrder * item.qty)}
												</span>
												<button
													type="button"
													onclick={() => handleReorderItem(item)}
													class="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DFD0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 hover:border-[#B5652F] hover:text-[#B5652F] transition-colors shadow-2xs"
													title="Tambahkan item ini kembali ke keranjang"
												>
													<RotateCcw class="h-3 w-3 text-[#B5652F]" />
													<span>Beli Lagi</span>
												</button>
											</div>
										</div>
									{/each}
								</div>

								<!-- Order Footer & Action -->
								<div
									class="flex flex-col gap-3 border-t border-[#E8DFD0] pt-4 sm:flex-row sm:items-center sm:justify-between text-xs"
								>
									<div class="text-stone-600">
										<span>Tujuan: <strong>{order.recipientName}</strong>, {order.shippingAddress}</span>
									</div>

									<div class="flex flex-wrap items-center gap-2">
										<!-- Order Completion Confirmation CTA (if status is 'Dikirim') -->
										{#if order.status === 'Dikirim'}
											<button
												type="button"
												onclick={() => handleCompleteOrder(order)}
												disabled={completingOrderId === order.id}
												class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
												title="Konfirmasi bahwa pesanan ini telah diterima dengan aman"
											>
												{#if completingOrderId === order.id}
													<span class="animate-spin text-xs">⏳</span>
													<span>Memproses...</span>
												{:else}
													<CheckCircle2 class="h-3.5 w-3.5" />
													<span>Konfirmasi Diterima</span>
												{/if}
											</button>
										{/if}

										<button
											type="button"
											onclick={() => handleReorderAll(order)}
											class="inline-flex items-center gap-1.5 rounded-lg border border-[#1F1810] bg-white px-3.5 py-2 text-xs font-semibold text-[#1F1810] hover:bg-[#F7F3EC] transition-colors shadow-2xs"
											title="Tambahkan seluruh item pesanan ini ke keranjang"
										>
											<RotateCcw class="h-3.5 w-3.5 text-[#B5652F]" />
											<span>Beli Lagi Semua</span>
										</button>
										<a
											href="/checkout/konfirmasi?order={order.orderNumber}"
											class="inline-flex items-center gap-1.5 rounded-lg bg-[#1F1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B5652F] transition-colors shadow-xs"
										>
											<span>Lihat E-Invoice</span>
											<ArrowRight class="h-3.5 w-3.5" />
										</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}

			<!-- TAB 2: KATALOG REWARD -->
			{:else if activeTab === 'rewards'}
				<div class="space-y-6">
					<!-- Category Filter Tabs -->
					<div class="flex flex-wrap items-center gap-2">
						{#each [
							{ id: 'all', label: 'Semua Reward' },
							{ id: 'voucher', label: 'Voucher Belanja' },
							{ id: 'layanan', label: 'Layanan & Desain' },
							{ id: 'garansi', label: 'Garansi Extended' },
							{ id: 'pengiriman', label: 'Prioritas Pengiriman' }
						] as cat}
							<button
								type="button"
								onclick={() => (selectedCategory = cat.id)}
								class="rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all {selectedCategory ===
								cat.id
									? 'bg-[#1F1810] text-white shadow-xs'
									: 'border border-[#E8DFD0] bg-white text-stone-600 hover:bg-[#F7F3EC]'}"
							>
								{cat.label}
							</button>
						{/each}
					</div>

					<!-- Rewards Grid -->
					{#if filteredRewards.length === 0}
						<div class="rounded-2xl border border-[#E8DFD0] bg-white p-12 text-center shadow-sm">
							<Gift class="mx-auto h-10 w-10 text-stone-300" />
							<p class="mt-2 text-xs text-stone-500">Tidak ada reward dalam kategori ini.</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{#each filteredRewards as reward}
								{@const eligibleTier = isTierEligible(currentTier, reward.minTier)}
								{@const pointsSufficient = (user.loyaltyPoints || 0) >= reward.pointsCost}
								{@const outOfStock = reward.stock !== null && reward.stock <= 0}

								<div
									class="flex flex-col justify-between rounded-2xl border border-[#E8DFD0] bg-white p-5 shadow-sm hover:border-[#B5652F]/40 transition-colors"
								>
									<div>
										<!-- Reward Card Header -->
										<div class="flex items-start justify-between gap-2 mb-3">
											<span
												class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider {getCategoryBadgeClass(
													reward.category
												)}"
											>
												{#if reward.category === 'voucher'}
													<Ticket class="h-3 w-3" />
												{:else if reward.category === 'layanan'}
													<Wrench class="h-3 w-3" />
												{:else if reward.category === 'garansi'}
													<ShieldCheck class="h-3 w-3" />
												{:else}
													<Truck class="h-3 w-3" />
												{/if}
												{reward.category}
											</span>

											<span
												class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold {getTierBadgeClass(
													reward.minTier
												)}"
											>
												Min. {reward.minTier}
											</span>
										</div>

										<!-- Title & Description -->
										<h3 class="font-serif text-base font-bold text-[#1F1810] leading-snug">
											{reward.name}
										</h3>
										<p class="mt-2 text-xs text-stone-600 leading-relaxed line-clamp-3">
											{reward.description}
										</p>

										<!-- Metadata details -->
										<div class="mt-4 flex flex-wrap gap-2 text-[11px] text-stone-500">
											{#if reward.validityDays}
												<span class="inline-flex items-center gap-1">
													<Calendar class="h-3 w-3 text-stone-400" />
													Berlaku {reward.validityDays} hari
												</span>
											{/if}
											{#if reward.stock !== null}
												<span class="inline-flex items-center gap-1 text-amber-700 font-medium">
													• Sisa kuota: {reward.stock}
												</span>
											{/if}
										</div>
									</div>

									<!-- Card Action Footer -->
									<div class="mt-5 border-t border-[#E8DFD0]/70 pt-4">
										<div class="flex items-center justify-between mb-3">
											<span class="text-xs text-stone-500 font-medium">Biaya Penukaran:</span>
											<span class="font-serif text-base font-bold text-[#B5652F]">
												{reward.pointsCost.toLocaleString('id-ID')} Poin
											</span>
										</div>

										{#if !eligibleTier}
											<button
												type="button"
												disabled
												class="w-full rounded-xl border border-stone-200 bg-stone-100 py-2.5 text-xs font-semibold text-stone-400 cursor-not-allowed"
											>
												Tier Belum Cukup (Min. {reward.minTier})
											</button>
										{:else if !pointsSufficient}
											<button
												type="button"
												disabled
												class="w-full rounded-xl border border-stone-200 bg-stone-100 py-2.5 text-xs font-semibold text-stone-400 cursor-not-allowed"
											>
												Poin Kurang ({reward.pointsCost - (user.loyaltyPoints || 0)} lagi)
											</button>
										{:else if outOfStock}
											<button
												type="button"
												disabled
												class="w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-400 cursor-not-allowed"
											>
												Kuota Habis
											</button>
										{:else}
											<button
												type="button"
												onclick={() => openRedeemModal(reward)}
												class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F1810] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#B5652F] transition-colors"
											>
												<Gift class="h-3.5 w-3.5" />
												<span>Tukarkan ({reward.pointsCost} Poin)</span>
											</button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

			<!-- TAB 3: REWARD SAYA -->
			{:else if activeTab === 'my-rewards'}
				<div class="space-y-6">
					{#if redemptions.length === 0}
						<div class="rounded-3xl border border-[#E8DFD0] bg-white px-6 py-16 text-center shadow-sm">
							<Ticket class="mx-auto h-12 w-12 text-stone-300" />
							<h2 class="mt-4 font-serif text-xl font-bold text-[#1F1810]">
								Belum Ada Reward yang Ditukarkan
							</h2>
							<p class="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
								Gunakan poin loyalitas Anda untuk menukar voucher belanja, perpanjangan garansi, atau
								sesi konsultasi desain.
							</p>
							<button
								type="button"
								onclick={() => (activeTab = 'rewards')}
								class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B5652F] transition-colors"
							>
								<span>Lihat Katalog Reward</span>
								<ArrowRight class="h-3.5 w-3.5" />
							</button>
						</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
							{#each redemptions as red}
								<div class="rounded-2xl border border-[#E8DFD0] bg-white p-5 sm:p-6 shadow-sm space-y-4">
									<div class="flex items-start justify-between gap-3">
										<div>
											<span
												class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider {getCategoryBadgeClass(
													red.reward.category
												)}"
											>
												{red.reward.category}
											</span>
											<h3 class="font-serif text-base font-bold text-[#1F1810] mt-1.5">
												{red.reward.name}
											</h3>
										</div>

										<Badge
											class={red.status === 'Aktif'
												? 'bg-emerald-100 text-emerald-800'
												: red.status === 'Digunakan'
													? 'bg-stone-100 text-stone-700'
													: 'bg-rose-100 text-rose-800'}
										>
											{red.status}
										</Badge>
									</div>

									<p class="text-xs text-stone-600 leading-relaxed">
										{red.reward.description}
									</p>

									<!-- Voucher code block if present -->
									{#if red.voucherCode}
										<div
											class="flex items-center justify-between rounded-xl border border-dashed border-[#B5652F] bg-[#FAF6F0] p-3"
										>
											<div>
												<span class="text-[10px] font-semibold uppercase text-stone-500 block">
													Kode Voucher
												</span>
												<span class="font-mono text-sm font-bold text-[#1F1810] tracking-wider">
													{red.voucherCode}
												</span>
											</div>
											<button
												type="button"
												onclick={() => copyToClipboard(red.voucherCode!)}
												class="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DFD0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F1810] hover:bg-[#E8DFD0]/40 transition-colors"
											>
												{#if copiedCode === red.voucherCode}
													<Check class="h-3.5 w-3.5 text-emerald-600" />
													<span class="text-emerald-700">Tersalin!</span>
												{:else}
													<Copy class="h-3.5 w-3.5 text-stone-500" />
													<span>Salin</span>
												{/if}
											</button>
										</div>
									{/if}

									<!-- Dates & Instructions footer -->
									<div
										class="border-t border-[#E8DFD0]/70 pt-3 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
									>
										<div>
											Ditukar: <strong>{formatDateId(red.redeemedAt)}</strong>
											{#if red.expiresAt}
												• Berlaku s/d: <strong>{formatDateId(red.expiresAt)}</strong>
											{/if}
										</div>

										{#if red.reward.category === 'layanan'}
											<a
												href="https://wa.me/6281234567890?text=Halo%20Maison%20Lumina,%20saya%20ingin%20klaim%20layanan%20{encodeURIComponent(
													red.reward.name
												)}%20(ID%20Redemption:%20{red.id})"
												target="_blank"
												rel="noreferrer"
												class="inline-flex items-center gap-1 text-[#B5652F] font-semibold hover:underline"
											>
												<span>Jadwalkan via WA</span>
												<ExternalLink class="h-3 w-3" />
											</a>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

			<!-- TAB 4: BUKU ALAMAT -->
			{:else if activeTab === 'addresses'}
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-6">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8DFD0]">
						<div>
							<h2 class="font-serif text-lg font-semibold text-[#1F1810]">
								Buku Alamat Pengiriman
							</h2>
							<p class="text-xs text-stone-500 mt-0.5">
								Kelola alamat tujuan pengiriman pesanan karya mebel Anda.
							</p>
						</div>
						<button
							type="button"
							onclick={openAddAddressModal}
							class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1F1810] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#B5652F] transition-colors self-start sm:self-auto"
						>
							<Plus class="h-4 w-4" />
							<span>Tambah Alamat Baru</span>
						</button>
					</div>

					{#if addresses.length > 0}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each addresses as addr}
								<div class="rounded-xl border {addr.isDefault ? 'border-[#B5652F]/60 bg-[#FAF8F5]' : 'border-[#E8DFD0] bg-white'} p-5 space-y-3 shadow-2xs hover:border-[#B5652F]/40 transition-colors flex flex-col justify-between">
									<div class="space-y-2">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2">
												{#if addr.isDefault}
													<span class="inline-flex items-center gap-1 rounded-md bg-[#1F1810] px-2 py-0.5 text-[10px] font-bold text-white">
														<Check class="h-3 w-3" />
														Alamat Utama
													</span>
												{:else}
													<span class="text-xs font-medium text-stone-500">Alamat Alternatif</span>
												{/if}
											</div>
											<div class="flex items-center gap-1">
												<button
													type="button"
													onclick={() => openEditAddressModal(addr)}
													class="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#F7F3EC] rounded-lg transition-colors"
													title="Edit Alamat"
												>
													<Pencil class="h-3.5 w-3.5" />
												</button>
												<button
													type="button"
													onclick={() => handleDeleteAddress(addr.id)}
													disabled={deletingAddressId === addr.id}
													class="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
													title="Hapus Alamat"
												>
													{#if deletingAddressId === addr.id}
														<Loader2 class="h-3.5 w-3.5 animate-spin text-rose-500" />
													{:else}
														<Trash2 class="h-3.5 w-3.5" />
													{/if}
												</button>
											</div>
										</div>

										<p class="text-xs font-bold text-[#1F1810]">
											{addr.recipient} <span class="font-normal text-stone-500">({addr.phone})</span>
										</p>
										<p class="text-xs text-stone-600 leading-relaxed">
											{addr.fullAddress}
										</p>
										{#if addr.notes}
											<div class="text-[11px] text-stone-500 italic bg-stone-50 rounded-lg px-2.5 py-1.5">
												Catatan: {addr.notes}
											</div>
										{/if}
									</div>

									{#if !addr.isDefault}
										<div class="pt-2 border-t border-[#E8DFD0]/60">
											<button
												type="button"
												onclick={() => handleSetDefaultAddress(addr)}
												class="text-[11px] font-semibold text-[#B5652F] hover:text-[#9E5424] hover:underline transition-colors"
											>
												Jadikan Alamat Utama
											</button>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-2xl border border-dashed border-[#E8DFD0] bg-[#FAF8F5] p-10 text-center space-y-3">
							<MapPin class="mx-auto h-10 w-10 text-stone-300" />
							<div class="space-y-1">
								<h3 class="font-serif text-base font-bold text-[#1F1810]">Belum Ada Alamat Tersimpan</h3>
								<p class="text-xs text-stone-500 max-w-sm mx-auto">
									Tambahkan alamat pengiriman rumah, kantor, atau studio Anda untuk mempercepat proses pemesanan.
								</p>
							</div>
							<button
								type="button"
								onclick={openAddAddressModal}
								class="inline-flex items-center gap-1.5 rounded-xl bg-[#1F1810] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#B5652F] transition-colors"
							>
								<Plus class="h-4 w-4" />
								<span>Tambah Alamat Pertama</span>
							</button>
						</div>
					{/if}
				</div>

			<!-- TAB: PROFIL & KEAMANAN -->
			{:else if activeTab === 'profile'}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Card 1: Profil Pengguna -->
					<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-5">
						<div class="flex items-center gap-3 pb-3 border-b border-[#E8DFD0]">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5652F]/10 text-[#B5652F]">
								<UserIcon class="h-5 w-5" />
							</div>
							<div>
								<h2 class="font-serif text-base font-bold text-[#1F1810]">Informasi Profil</h2>
								<p class="text-[11px] text-stone-500">Kelola identitas akun Anda di Maison Lumina.</p>
							</div>
						</div>

						<form onsubmit={handleUpdateProfile} class="space-y-4">
							<div>
								<label for="profile-name" class="block text-xs font-medium text-stone-700 mb-1">
									Nama Lengkap *
								</label>
								<input
									id="profile-name"
									type="text"
									required
									bind:value={editName}
									class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
									placeholder="Nama lengkap Anda"
								/>
							</div>

							<div>
								<label for="profile-email" class="block text-xs font-medium text-stone-700 mb-1">
									Alamat Email
								</label>
								<input
									id="profile-email"
									type="email"
									disabled
									value={user.email}
									class="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-500 cursor-not-allowed"
								/>
								<span class="mt-1 block text-[10px] text-stone-400">
									Alamat email terdaftar tidak dapat diubah demi keamanan akun.
								</span>
							</div>

							<div class="rounded-xl border border-[#E8DFD0] bg-[#FAF8F5] p-3 text-xs flex items-center justify-between">
								<span class="text-stone-600 font-medium">Tingkat Membership:</span>
								<span class="font-bold text-[#B5652F]">{tierMeta.label} ({user.loyaltyPoints || 0} Poin)</span>
							</div>

							<button
								type="submit"
								disabled={isSavingProfile || !editName.trim()}
								class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F1810] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#B5652F] transition-colors disabled:opacity-50"
							>
								{#if isSavingProfile}
									<Loader2 class="h-3.5 w-3.5 animate-spin" />
									<span>Menyimpan Perubahan...</span>
								{:else}
									<Check class="h-3.5 w-3.5" />
									<span>Simpan Perubahan Profil</span>
								{/if}
							</button>
						</form>
					</div>

					<!-- Card 2: Ubah Kata Sandi -->
					<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow-sm space-y-5">
						<div class="flex items-center gap-3 pb-3 border-b border-[#E8DFD0]">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
								<Lock class="h-5 w-5" />
							</div>
							<div>
								<h2 class="font-serif text-base font-bold text-[#1F1810]">Keamanan &amp; Kata Sandi</h2>
								<p class="text-[11px] text-stone-500">Perbarui kata sandi secara berkala untuk menjaga akun tetap aman.</p>
							</div>
						</div>

						<form onsubmit={handleChangePassword} class="space-y-4">
							<div>
								<label for="curr-password" class="block text-xs font-medium text-stone-700 mb-1">
									Kata Sandi Saat Ini *
								</label>
								<input
									id="curr-password"
									type="password"
									required
									bind:value={currentPassword}
									class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
									placeholder="••••••••"
								/>
							</div>

							<div>
								<label for="new-password" class="block text-xs font-medium text-stone-700 mb-1">
									Kata Sandi Baru (Min. {PASSWORD_MIN_LENGTH} Karakter) *
								</label>
								<input
									id="new-password"
									type="password"
									required
									minlength={PASSWORD_MIN_LENGTH}
									bind:value={newPassword}
									class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
									placeholder="••••••••"
								/>

								<!-- Password Strength Indicator (UX aid only) -->
								{#if newPassword.length > 0}
									<div class="mt-2 space-y-1.5">
										<div class="flex gap-1">
											{#each [1, 2, 3, 4] as seg}
												<div
													class="h-1.5 flex-1 rounded-full transition-all duration-300"
													style="background-color: {newPwStrength.level >= seg ? newPwStrength.color : '#E8DFD0'}"
												></div>
											{/each}
										</div>
										<span class="text-[10px] font-semibold" style="color: {newPwStrength.color}">
											Kekuatan: {newPwStrength.label}
										</span>
										<div class="grid grid-cols-2 gap-1 text-[10px]">
											<div class="flex items-center gap-1 {newPwStrength.checks.minLength ? 'text-emerald-600' : 'text-stone-400'}">
												{#if newPwStrength.checks.minLength}<Check class="h-2.5 w-2.5" />{:else}<X class="h-2.5 w-2.5" />{/if}
												<span>Min. {PASSWORD_MIN_LENGTH} karakter</span>
											</div>
											<div class="flex items-center gap-1 {newPwStrength.checks.hasUpperLower ? 'text-emerald-600' : 'text-stone-400'}">
												{#if newPwStrength.checks.hasUpperLower}<Check class="h-2.5 w-2.5" />{:else}<X class="h-2.5 w-2.5" />{/if}
												<span>Huruf besar &amp; kecil</span>
											</div>
											<div class="flex items-center gap-1 {newPwStrength.checks.hasNumber ? 'text-emerald-600' : 'text-stone-400'}">
												{#if newPwStrength.checks.hasNumber}<Check class="h-2.5 w-2.5" />{:else}<X class="h-2.5 w-2.5" />{/if}
												<span>Mengandung angka</span>
											</div>
											<div class="flex items-center gap-1 {newPwStrength.checks.hasSymbol ? 'text-emerald-600' : 'text-stone-400'}">
												{#if newPwStrength.checks.hasSymbol}<Check class="h-2.5 w-2.5" />{:else}<X class="h-2.5 w-2.5" />{/if}
												<span>Karakter khusus</span>
											</div>
										</div>
									</div>
								{/if}
							</div>

							<div>
								<label for="conf-new-password" class="block text-xs font-medium text-stone-700 mb-1">
									Konfirmasi Kata Sandi Baru *
								</label>
								<input
									id="conf-new-password"
									type="password"
									required
									minlength={PASSWORD_MIN_LENGTH}
									bind:value={confirmNewPassword}
									class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-xs text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
									placeholder="••••••••"
								/>
								{#if confirmNewPassword.length > 0 && newPassword !== confirmNewPassword}
									<span class="mt-1 block text-[10px] text-rose-500 font-medium">
										Konfirmasi kata sandi tidak cocok.
									</span>
								{/if}
							</div>

							<button
								type="submit"
								disabled={isChangingPassword || !isChangePasswordReady}
								class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5652F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#9E5424] transition-colors disabled:opacity-50"
							>
								{#if isChangingPassword}
									<Loader2 class="h-3.5 w-3.5 animate-spin" />
									<span>Memperbarui Kata Sandi...</span>
								{:else}
									<Lock class="h-3.5 w-3.5" />
									<span>Perbarui Kata Sandi</span>
								{/if}
							</button>
						</form>
					</div>
				</div>

			<!-- TAB 5: CONCIERGE ATELIER -->
			{:else if activeTab === 'concierge'}
				<div class="rounded-2xl border border-[#E8DFD0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
					<div class="flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-[#B5652F]/10 text-[#B5652F]"
						>
							<Phone class="h-6 w-6" />
						</div>
						<div>
							<h2 class="font-serif text-xl font-bold text-[#1F1810]">
								Layanan Concierge Eksklusif {tierMeta.label}
							</h2>
							<p class="text-xs text-stone-600">
								Konsultasi langsung dengan tim desainer interior &amp; ahli perakitan mebel kami.
							</p>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
						<div class="rounded-xl border border-[#E8DFD0] p-4 bg-[#F7F3EC]/40 space-y-2">
							<ShieldCheck class="h-5 w-5 text-[#B5652F]" />
							<span class="font-bold text-[#1F1810] block">Garansi Rangka 2 Tahun</span>
							<p class="text-stone-600">
								Perlindungan struktur kayu solid dan konstruksi purus sambungan tradisional.
							</p>
						</div>

						<div class="rounded-xl border border-[#E8DFD0] p-4 bg-[#F7F3EC]/40 space-y-2">
							<Wrench class="h-5 w-5 text-[#B5652F]" />
							<span class="font-bold text-[#1F1810] block">Perawatan &amp; Oiling Kayu</span>
							<p class="text-stone-600">
								Panduan dan kit perawatan minyak jati alami agar keindahan kayu abadi.
							</p>
						</div>

						<div class="rounded-xl border border-[#E8DFD0] p-4 bg-[#F7F3EC]/40 space-y-2">
							<Sparkles class="h-5 w-5 text-[#B5652F]" />
							<span class="font-bold text-[#1F1810] block">Custom Dimensi &amp; Kain</span>
							<p class="text-stone-600">
								Bisa meminta penyesuaian ukuran khusus untuk tata ruang kamar Anda.
							</p>
						</div>
					</div>

					<div class="border-t border-[#E8DFD0] pt-5">
						<a
							href="https://wa.me/6281234567890?text=Halo%20Maison%20Lumina,%20saya%20member%20{encodeURIComponent(
								tierMeta.label
							)}%20{encodeURIComponent(user.name)}%20ingin%20berkonsultasi"
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#B5652F] transition-colors"
						>
							<Phone class="h-4 w-4" />
							<span>Hubungi Konsultan via WhatsApp</span>
							<ArrowRight class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- REDEEM CONFIRMATION MODAL -->
{#if rewardToRedeem}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
	>
		<div
			class="w-full max-w-md rounded-3xl border border-[#E8DFD0] bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
		>
			<div class="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
				<div class="flex items-center gap-2 text-stone-900">
					<Gift class="h-5 w-5 text-[#B5652F]" />
					<h3 class="font-serif text-lg font-bold">Konfirmasi Penukaran</h3>
				</div>
				<button
					type="button"
					onclick={() => (rewardToRedeem = null)}
					class="text-stone-400 hover:text-stone-700 text-sm font-bold"
				>
					✕
				</button>
			</div>

			<div class="space-y-3 text-xs">
				<p class="text-stone-600">
					Anda akan menukarkan poin loyalitas untuk mendapatkan reward berikut:
				</p>

				<div class="rounded-xl border border-[#E8DFD0] bg-[#F7F3EC]/70 p-4 space-y-1">
					<span class="font-serif text-sm font-bold text-[#1F1810] block">
						{rewardToRedeem.name}
					</span>
					<p class="text-stone-600">{rewardToRedeem.description}</p>
				</div>

				<div class="rounded-xl border border-[#E8DFD0] p-3 divide-y divide-[#E8DFD0]/60 space-y-2">
					<div class="flex justify-between pt-1">
						<span class="text-stone-500">Poin Saat Ini:</span>
						<span class="font-semibold text-stone-800"
							>{(user.loyaltyPoints || 0).toLocaleString('id-ID')} Pts</span
						>
					</div>
					<div class="flex justify-between pt-2">
						<span class="text-stone-500">Biaya Penukaran:</span>
						<span class="font-bold text-rose-600"
							>-{rewardToRedeem.pointsCost.toLocaleString('id-ID')} Pts</span
						>
					</div>
					<div class="flex justify-between pt-2">
						<span class="font-semibold text-stone-800">Sisa Poin:</span>
						<span class="font-bold text-[#B5652F]"
							>{Math.max(
								0,
								(user.loyaltyPoints || 0) - rewardToRedeem.pointsCost
							).toLocaleString('id-ID')} Pts</span
						>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-end gap-3 pt-2">
				<button
					type="button"
					onclick={() => (rewardToRedeem = null)}
					disabled={isRedeeming}
					class="rounded-xl border border-[#E8DFD0] bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
				>
					Batal
				</button>
				<button
					type="button"
					onclick={handleRedeemReward}
					disabled={isRedeeming}
					class="inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#B5652F] transition-colors disabled:opacity-50 shadow-sm"
				>
					{#if isRedeeming}
						<span class="animate-spin text-xs">⏳</span>
						<span>Memproses...</span>
					{:else}
						<Check class="h-4 w-4" />
						<span>Konfirmasi Tukar</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- ADDRESS ADD / EDIT MODAL -->
{#if showAddressModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
	>
		<div
			class="w-full max-w-lg rounded-3xl border border-[#E8DFD0] bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
				<div class="flex items-center gap-2 text-stone-900">
					<MapPin class="h-5 w-5 text-[#B5652F]" />
					<h3 class="font-serif text-lg font-bold">
						{editingAddressId ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Baru'}
					</h3>
				</div>
				<button
					type="button"
					onclick={() => (showAddressModal = false)}
					class="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<form onsubmit={handleSaveAddress} class="space-y-4 text-xs">
				<div>
					<label for="addr-recipient" class="block font-medium text-stone-700 mb-1">
						Nama Penerima *
					</label>
					<input
						id="addr-recipient"
						type="text"
						required
						bind:value={addressForm.recipient}
						placeholder="Contoh: Dian Sastrowardoyo"
						class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
					/>
				</div>

				<div>
					<label for="addr-phone" class="block font-medium text-stone-700 mb-1">
						Nomor Telepon / WhatsApp *
					</label>
					<input
						id="addr-phone"
						type="tel"
						required
						bind:value={addressForm.phone}
						placeholder="Contoh: 081234567890"
						class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
					/>
				</div>

				<div>
					<label for="addr-full" class="block font-medium text-stone-700 mb-1">
						Alamat Lengkap &amp; Kode Pos *
					</label>
					<textarea
						id="addr-full"
						rows="3"
						required
						bind:value={addressForm.fullAddress}
						placeholder="Nama jalan, nomor rumah/gedung, RT/RW, kelurahan, kecamatan, kota, provinsi, dan kode pos"
						class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-[#1F1810] focus:border-[#B5652F] focus:outline-none resize-none"
					></textarea>
				</div>

				<div>
					<label for="addr-notes" class="block font-medium text-stone-700 mb-1">
						Catatan Pengiriman (Opsional)
					</label>
					<input
						id="addr-notes"
						type="text"
						bind:value={addressForm.notes}
						placeholder="Contoh: Rumah pagar hitam, titip di satpam jika tidak ada orang"
						class="w-full rounded-xl border border-[#E8DFD0] px-3.5 py-2.5 text-[#1F1810] focus:border-[#B5652F] focus:outline-none"
					/>
				</div>

				<div class="pt-1">
					<label class="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							bind:checked={addressForm.isDefault}
							class="h-4 w-4 rounded border-stone-300 text-[#B5652F] focus:ring-[#B5652F]"
						/>
						<span class="text-stone-700 font-medium">Jadikan alamat pengiriman utama (default)</span>
					</label>
				</div>

				<div class="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD0]">
					<button
						type="button"
						onclick={() => (showAddressModal = false)}
						disabled={isSavingAddress}
						class="rounded-xl border border-[#E8DFD0] bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={isSavingAddress}
						class="inline-flex items-center gap-2 rounded-xl bg-[#1F1810] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#B5652F] transition-colors disabled:opacity-50 shadow-sm"
					>
						{#if isSavingAddress}
							<Loader2 class="h-3.5 w-3.5 animate-spin" />
							<span>Menyimpan...</span>
						{:else}
							<Check class="h-4 w-4" />
							<span>{editingAddressId ? 'Simpan Perubahan' : 'Tambah Alamat'}</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

