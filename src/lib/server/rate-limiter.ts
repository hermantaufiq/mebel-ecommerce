// TODO: In-memory rate limiter ini hanya akurat untuk single-instance deployment.
// Ganti dengan solusi berbasis Redis/database kalau nanti deploy ke platform 
// serverless/multi-instance (state tidak dibagi antar instance).

interface RateLimitRecord {
	count: number;
	resetTime: number;
}

class InMemoryRateLimiter {
	private records = new Map<string, RateLimitRecord>();
	private windowMs: number;
	private maxRequests: number;

	constructor(maxRequests = 10, windowMs = 60 * 1000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;

		// Periodically clean up expired entries every 5 minutes
		if (typeof setInterval !== 'undefined') {
			setInterval(() => this.cleanup(), 5 * 60 * 1000);
		}
	}

	check(key: string): { allowed: boolean; remaining: number; resetInMs: number } {
		const now = Date.now();
		const record = this.records.get(key);

		if (!record || now > record.resetTime) {
			// New window
			this.records.set(key, {
				count: 1,
				resetTime: now + this.windowMs
			});
			return {
				allowed: true,
				remaining: this.maxRequests - 1,
				resetInMs: this.windowMs
			};
		}

		if (record.count < this.maxRequests) {
			record.count += 1;
			return {
				allowed: true,
				remaining: this.maxRequests - record.count,
				resetInMs: record.resetTime - now
			};
		}

		return {
			allowed: false,
			remaining: 0,
			resetInMs: record.resetTime - now
		};
	}

	private cleanup() {
		const now = Date.now();
		for (const [key, record] of this.records.entries()) {
			if (now > record.resetTime) {
				this.records.delete(key);
			}
		}
	}
}

// Default limiter for authentication endpoints: max 10 attempts per minute per IP
export const authRateLimiter = new InMemoryRateLimiter(10, 60 * 1000);
