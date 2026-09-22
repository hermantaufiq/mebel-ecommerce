import { describe, it, expect } from 'vitest';
import {
	calculateTier,
	isTierEligible,
	getNextTierInfo
} from './tier-config';

describe('Tier Membership & Reward Calculations', () => {
	describe('calculateTier', () => {
		it('should classify < 10jt as Regular', () => {
			expect(calculateTier(0)).toBe('Regular');
			expect(calculateTier(5_000_000)).toBe('Regular');
			expect(calculateTier(9_999_999)).toBe('Regular');
		});

		it('should classify 10jt - <50jt as Silver', () => {
			expect(calculateTier(10_000_000)).toBe('Silver');
			expect(calculateTier(28_500_000)).toBe('Silver');
			expect(calculateTier(49_999_999)).toBe('Silver');
		});

		it('should classify 50jt - <150jt as Gold', () => {
			expect(calculateTier(50_000_000)).toBe('Gold');
			expect(calculateTier(100_000_000)).toBe('Gold');
			expect(calculateTier(149_999_999)).toBe('Gold');
		});

		it('should classify >= 150jt as Platinum', () => {
			expect(calculateTier(150_000_000)).toBe('Platinum');
			expect(calculateTier(250_000_000)).toBe('Platinum');
		});
	});

	describe('isTierEligible', () => {
		it('should correctly evaluate Regular user permissions', () => {
			expect(isTierEligible('Regular', 'Regular')).toBe(true);
			expect(isTierEligible('Regular', 'Silver')).toBe(false);
			expect(isTierEligible('Regular', 'Gold')).toBe(false);
			expect(isTierEligible('Regular', 'Platinum')).toBe(false);
		});

		it('should correctly evaluate Silver user permissions', () => {
			expect(isTierEligible('Silver', 'Regular')).toBe(true);
			expect(isTierEligible('Silver', 'Silver')).toBe(true);
			expect(isTierEligible('Silver', 'Gold')).toBe(false);
			expect(isTierEligible('Silver', 'Platinum')).toBe(false);
		});

		it('should correctly evaluate Gold user permissions', () => {
			expect(isTierEligible('Gold', 'Regular')).toBe(true);
			expect(isTierEligible('Gold', 'Silver')).toBe(true);
			expect(isTierEligible('Gold', 'Gold')).toBe(true);
			expect(isTierEligible('Gold', 'Platinum')).toBe(false);
		});

		it('should correctly evaluate Platinum user permissions', () => {
			expect(isTierEligible('Platinum', 'Regular')).toBe(true);
			expect(isTierEligible('Platinum', 'Silver')).toBe(true);
			expect(isTierEligible('Platinum', 'Gold')).toBe(true);
			expect(isTierEligible('Platinum', 'Platinum')).toBe(true);
		});
	});

	describe('getNextTierInfo', () => {
		it('should calculate progress towards Silver for Regular users', () => {
			const info = getNextTierInfo(5_000_000);
			expect(info.currentTier).toBe('Regular');
			expect(info.nextTier).toBe('Silver');
			expect(info.neededAmount).toBe(5_000_000);
			expect(info.progressPercent).toBe(50);
		});

		it('should calculate progress towards Gold for Silver users', () => {
			// Range is 10jt to 50jt (span 40jt). At 30jt, progress is 20jt/40jt = 50%
			const info = getNextTierInfo(30_000_000);
			expect(info.currentTier).toBe('Silver');
			expect(info.nextTier).toBe('Gold');
			expect(info.neededAmount).toBe(20_000_000);
			expect(info.progressPercent).toBe(50);
		});

		it('should calculate progress towards Platinum for Gold users', () => {
			// Range is 50jt to 150jt (span 100jt). At 100jt, progress is 50jt/100jt = 50%
			const info = getNextTierInfo(100_000_000);
			expect(info.currentTier).toBe('Gold');
			expect(info.nextTier).toBe('Platinum');
			expect(info.neededAmount).toBe(50_000_000);
			expect(info.progressPercent).toBe(50);
		});

		it('should handle Platinum tier as maxed out', () => {
			const info = getNextTierInfo(180_000_000);
			expect(info.currentTier).toBe('Platinum');
			expect(info.nextTier).toBeNull();
			expect(info.neededAmount).toBe(0);
			expect(info.progressPercent).toBe(100);
		});
	});
});
