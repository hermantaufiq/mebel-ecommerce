import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

// ====================================================================
// POST — Create new address
// Koreksi 3: isDefault toggle wrapped in $transaction
// ====================================================================
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Silakan masuk ke akun Anda terlebih dahulu' }, { status: 401 });
	}

	try {
		const { recipient, phone, fullAddress, notes, isDefault } = await request.json();

		if (!recipient || !phone || !fullAddress) {
			return json(
				{ error: 'Penerima, nomor telepon, dan alamat lengkap wajib diisi' },
				{ status: 400 }
			);
		}

		let newAddress;

		if (isDefault) {
			// Koreksi 3: Wrap unset+create in $transaction to prevent orphan default state
			newAddress = await prisma.$transaction(async (tx) => {
				await tx.address.updateMany({
					where: { userId: user.id, isDefault: true },
					data: { isDefault: false }
				});
				return tx.address.create({
					data: {
						userId: user.id,
						recipient: recipient.trim(),
						phone: phone.trim(),
						fullAddress: fullAddress.trim(),
						notes: notes?.trim() || null,
						isDefault: true
					}
				});
			});
		} else {
			newAddress = await prisma.address.create({
				data: {
					userId: user.id,
					recipient: recipient.trim(),
					phone: phone.trim(),
					fullAddress: fullAddress.trim(),
					notes: notes?.trim() || null,
					isDefault: false
				}
			});
		}

		return json({ success: true, address: newAddress });
	} catch (err: any) {
		console.error('Error creating address:', err);
		return json({ error: 'Terjadi kesalahan saat menyimpan alamat' }, { status: 500 });
	}
};

// ====================================================================
// PUT — Update existing address
// Koreksi 2: Anti-IDOR — userId in WHERE clause via updateMany
// Koreksi 3: isDefault toggle in $transaction
// ====================================================================
export const PUT: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Silakan masuk ke akun Anda terlebih dahulu' }, { status: 401 });
	}

	try {
		const { id, recipient, phone, fullAddress, notes, isDefault } = await request.json();

		if (!id) {
			return json({ error: 'ID alamat wajib disertakan' }, { status: 400 });
		}

		if (!recipient || !phone || !fullAddress) {
			return json(
				{ error: 'Penerima, nomor telepon, dan alamat lengkap wajib diisi' },
				{ status: 400 }
			);
		}

		const updateData = {
			recipient: recipient.trim(),
			phone: phone.trim(),
			fullAddress: fullAddress.trim(),
			notes: notes?.trim() || null,
			isDefault: !!isDefault
		};

		if (isDefault) {
			// Koreksi 3: Wrap unset old default + set new default in $transaction
			const result = await prisma.$transaction(async (tx) => {
				await tx.address.updateMany({
					where: { userId: user.id, isDefault: true },
					data: { isDefault: false }
				});
				// Koreksi 2: Anti-IDOR — userId in WHERE
				return tx.address.updateMany({
					where: { id, userId: user.id },
					data: updateData
				});
			});

			if (result.count === 0) {
				return json({ error: 'Alamat tidak ditemukan' }, { status: 404 });
			}
		} else {
			// Koreksi 2: Anti-IDOR — userId in WHERE clause
			const result = await prisma.address.updateMany({
				where: { id, userId: user.id },
				data: updateData
			});

			if (result.count === 0) {
				return json({ error: 'Alamat tidak ditemukan' }, { status: 404 });
			}
		}

		return json({ success: true, message: 'Alamat berhasil diperbarui' });
	} catch (err: any) {
		console.error('Error updating address:', err);
		return json({ error: 'Terjadi kesalahan saat memperbarui alamat' }, { status: 500 });
	}
};

// ====================================================================
// DELETE — Remove address
// Koreksi 2: Anti-IDOR — userId in WHERE clause via deleteMany
// ====================================================================
export const DELETE: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Silakan masuk ke akun Anda terlebih dahulu' }, { status: 401 });
	}

	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'ID alamat wajib disertakan' }, { status: 400 });
		}

		// Koreksi 2: Anti-IDOR — kepemilikan langsung di dalam query
		const result = await prisma.address.deleteMany({
			where: { id, userId: user.id }
		});

		if (result.count === 0) {
			return json({ error: 'Alamat tidak ditemukan' }, { status: 404 });
		}

		return json({ success: true, message: 'Alamat berhasil dihapus' });
	} catch (err: any) {
		console.error('Error deleting address:', err);
		return json({ error: 'Terjadi kesalahan saat menghapus alamat' }, { status: 500 });
	}
};
