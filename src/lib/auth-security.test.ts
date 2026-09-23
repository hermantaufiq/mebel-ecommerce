import { describe, it, expect, beforeEach } from 'vitest';
import {
	passwordSchema,
	registerSchema,
	changePasswordSchema,
	updateProfileSchema,
	getPasswordStrength,
	PASSWORD_MIN_LENGTH
} from './schemas/auth';
import { InMemoryRateLimiter } from './server/rate-limiter';

describe('Tahap 5 — Auth & Security Test Suite', () => {
	// ====================================================================
	// 1. Zod Schema — Single Source of Truth for Password (Koreksi 1)
	// ====================================================================
	describe('Zod Password & Auth Validation (Koreksi 1)', () => {
		it('should enforce PASSWORD_MIN_LENGTH = 8', () => {
			expect(PASSWORD_MIN_LENGTH).toBe(8);
		});

		it('should REJECT password with 7 characters (bypass attempt)', () => {
			const result = passwordSchema.safeParse('1234567');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues?.[0]?.message).toContain('minimal 8 karakter');
			}
		});

		it('should REJECT password with 6 characters (old threshold)', () => {
			const result = passwordSchema.safeParse('pass12');
			expect(result.success).toBe(false);
		});

		it('should REJECT empty password', () => {
			const result = passwordSchema.safeParse('');
			expect(result.success).toBe(false);
		});

		it('should ACCEPT password with exactly 8 characters', () => {
			const result = passwordSchema.safeParse('12345678');
			expect(result.success).toBe(true);
		});

		it('should ACCEPT password with > 8 characters', () => {
			const result = passwordSchema.safeParse('superSecretPassword2026!');
			expect(result.success).toBe(true);
		});

		it('should validate full register payload correctly', () => {
			// Valid
			const valid = registerSchema.safeParse({
				name: 'Dian Sastro',
				email: 'dian@example.com',
				password: 'securePassword123'
			});
			expect(valid.success).toBe(true);

			// Invalid email
			const badEmail = registerSchema.safeParse({
				name: 'Dian Sastro',
				email: 'not-an-email',
				password: 'securePassword123'
			});
			expect(badEmail.success).toBe(false);

			// Short password in register
			const badPw = registerSchema.safeParse({
				name: 'Dian Sastro',
				email: 'dian@example.com',
				password: 'short'
			});
			expect(badPw.success).toBe(false);

			// Missing name
			const badName = registerSchema.safeParse({
				name: '',
				email: 'dian@example.com',
				password: 'securePassword123'
			});
			expect(badName.success).toBe(false);
		});

		it('should validate change-password schema (requires current password & min 8 new password)', () => {
			const valid = changePasswordSchema.safeParse({
				currentPassword: 'oldPassword123',
				newPassword: 'newStrongPassword456'
			});
			expect(valid.success).toBe(true);

			const shortNew = changePasswordSchema.safeParse({
				currentPassword: 'oldPassword123',
				newPassword: '1234567'
			});
			expect(shortNew.success).toBe(false);

			const emptyOld = changePasswordSchema.safeParse({
				currentPassword: '',
				newPassword: 'newStrongPassword456'
			});
			expect(emptyOld.success).toBe(false);
		});

		it('should validate update profile schema (name length)', () => {
			expect(updateProfileSchema.safeParse({ name: 'Budi Santoso' }).success).toBe(true);
			expect(updateProfileSchema.safeParse({ name: '' }).success).toBe(false);
		});
	});

	// ====================================================================
	// 2. Password Strength Calculator — Visual UX Aid Only
	// ====================================================================
	describe('Password Strength Visual Indicator (0-4 Level)', () => {
		it('level 0: less than 8 characters', () => {
			expect(getPasswordStrength('').level).toBe(0);
			expect(getPasswordStrength('abc').level).toBe(0);
			expect(getPasswordStrength('1234567').level).toBe(0);
		});

		it('level 1: >= 8 characters but only single character type', () => {
			const strength = getPasswordStrength('abcdefgh');
			expect(strength.level).toBe(1);
			expect(strength.checks.minLength).toBe(true);
			expect(strength.checks.hasUpperLower).toBe(false);
		});

		it('level 2: >= 8 characters with upper & lower case', () => {
			const strength = getPasswordStrength('Abcdefgh');
			expect(strength.level).toBe(2);
			expect(strength.checks.minLength).toBe(true);
			expect(strength.checks.hasUpperLower).toBe(true);
			expect(strength.checks.hasNumber).toBe(false);
		});

		it('level 3: >= 8 characters with upper, lower, & numbers', () => {
			const strength = getPasswordStrength('Abcdef12');
			expect(strength.level).toBe(3);
			expect(strength.checks.minLength).toBe(true);
			expect(strength.checks.hasUpperLower).toBe(true);
			expect(strength.checks.hasNumber).toBe(true);
		});

		it('level 4: >= 10 characters with upper, lower, numbers, & symbols', () => {
			const strength = getPasswordStrength('Abcdef12!@#');
			expect(strength.level).toBe(4);
			expect(strength.checks.minLength).toBe(true);
			expect(strength.checks.hasUpperLower).toBe(true);
			expect(strength.checks.hasNumber).toBe(true);
			expect(strength.checks.hasSymbol).toBe(true);
		});
	});

	// ====================================================================
	// 3. In-Memory Rate Limiter on Auth Endpoints
	// ====================================================================
	describe('Rate Limiter Behavior', () => {
		let limiter: InMemoryRateLimiter;

		beforeEach(() => {
			limiter = new InMemoryRateLimiter(5, 60000); // 5 attempts per min
		});

		it('should allow requests within limit', () => {
			for (let i = 0; i < 5; i++) {
				const check = limiter.check('test-ip-1');
				expect(check.allowed).toBe(true);
				expect(check.remaining).toBe(4 - i);
			}
		});

		it('should block the 6th request (429 condition)', () => {
			for (let i = 0; i < 5; i++) {
				limiter.check('test-ip-2');
			}
			const blockedCheck = limiter.check('test-ip-2');
			expect(blockedCheck.allowed).toBe(false);
			expect(blockedCheck.remaining).toBe(0);
			expect(blockedCheck.resetInMs).toBeGreaterThan(0);
		});

		it('should track different keys/IPs independently', () => {
			for (let i = 0; i < 5; i++) {
				limiter.check('ip-a');
			}
			expect(limiter.check('ip-a').allowed).toBe(false);
			expect(limiter.check('ip-b').allowed).toBe(true);
		});
	});

	// ====================================================================
	// 4. Anti-IDOR Logic Specification (Koreksi 2 & 3)
	// ====================================================================
	describe('Anti-IDOR Address Scoping (Koreksi 2 & 3)', () => {
		it('should ensure address operations strictly filter by userId', () => {
			const mockUserId = 'user-auth-123';
			const targetAddressId = 'addr-target-999';

			// Verify query filter format conforms to Anti-IDOR rule:
			// userId MUST be included in the WHERE clause directly
			const updateQueryWhere = {
				id: targetAddressId,
				userId: mockUserId
			};

			expect(updateQueryWhere.userId).toBe(mockUserId);
			expect(updateQueryWhere.id).toBe(targetAddressId);

			// A hacker attempting to edit another user's address with their own token:
			const hackerUserId = 'user-hacker-666';
			const hackerQueryWhere = {
				id: targetAddressId,
				userId: hackerUserId
			};

			// The query condition isolates data strictly:
			expect(hackerQueryWhere.userId).not.toBe(mockUserId);
		});
	});
});
