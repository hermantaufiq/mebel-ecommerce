import { describe, it, expect } from 'vitest';
import { authRateLimiter } from './rate-limiter';

describe('InMemoryRateLimiter', () => {
	it('should allow requests within limit and block when exceeded', () => {
		const testKey = `ip-test-${Date.now()}`;

		// Up to 10 requests allowed
		for (let i = 0; i < 10; i++) {
			const res = authRateLimiter.check(testKey);
			expect(res.allowed).toBe(true);
			expect(res.remaining).toBe(9 - i);
		}

		// 11th request must be blocked
		const blocked = authRateLimiter.check(testKey);
		expect(blocked.allowed).toBe(false);
		expect(blocked.remaining).toBe(0);
	});
});
