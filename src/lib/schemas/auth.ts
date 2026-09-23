import { z } from 'zod';

// ====================================================================
// Zod Auth Schemas — Single Source of Truth
// Digunakan oleh server endpoints DAN client form validation.
// Jangan ubah minimum password di sini tanpa sinkronisasi keduanya.
// ====================================================================

export const PASSWORD_MIN_LENGTH = 8;

export const passwordSchema = z
	.string()
	.min(PASSWORD_MIN_LENGTH, `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter`);

export const loginSchema = z.object({
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(1, 'Kata sandi wajib diisi')
});

export const registerSchema = z.object({
	name: z.string().min(1, 'Nama lengkap wajib diisi').max(100, 'Nama terlalu panjang'),
	email: z.string().email('Format email tidak valid'),
	password: passwordSchema
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Kata sandi lama wajib diisi'),
	newPassword: passwordSchema
});

export const updateProfileSchema = z.object({
	name: z.string().min(1, 'Nama lengkap wajib diisi').max(100, 'Nama terlalu panjang')
});

// ====================================================================
// Password Strength Calculator — UX Aid Only (NOT validation)
// Ini hanya untuk visual indicator, bukan pengganti Zod schema.
// ====================================================================

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
	level: PasswordStrengthLevel;
	label: string;
	color: string;
	checks: {
		minLength: boolean;
		hasUpperLower: boolean;
		hasNumber: boolean;
		hasSymbol: boolean;
	};
}

export function getPasswordStrength(password: string): PasswordStrength {
	const checks = {
		minLength: password.length >= PASSWORD_MIN_LENGTH,
		hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSymbol: /[^a-zA-Z0-9]/.test(password)
	};

	let level: PasswordStrengthLevel = 0;

	if (!checks.minLength) {
		level = 0;
	} else if (checks.minLength && checks.hasUpperLower && checks.hasNumber && checks.hasSymbol && password.length >= 10) {
		level = 4;
	} else if (checks.minLength && checks.hasUpperLower && checks.hasNumber) {
		level = 3;
	} else if (checks.minLength && checks.hasUpperLower) {
		level = 2;
	} else {
		level = 1;
	}

	const labels: Record<PasswordStrengthLevel, string> = {
		0: 'Sangat Lemah',
		1: 'Lemah',
		2: 'Cukup',
		3: 'Kuat',
		4: 'Sangat Kuat'
	};

	const colors: Record<PasswordStrengthLevel, string> = {
		0: '#ef4444',
		1: '#f97316',
		2: '#eab308',
		3: '#22c55e',
		4: '#059669'
	};

	return {
		level,
		label: labels[level],
		color: colors[level],
		checks
	};
}
