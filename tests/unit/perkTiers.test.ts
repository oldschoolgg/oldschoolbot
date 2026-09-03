import { Time } from '@oldschoolgg/toolkit';
import { describe, expect, test } from 'vitest';

import { getCyrTripBonus, getRoboChimpPaidTierDisplay } from '@/lib/perkTiers.js';

describe('perk tier helpers', () => {
	test('formats robochimp paid tier labels', () => {
		expect(getRoboChimpPaidTierDisplay([19, 10], { perkTier: 5 })).toBe('Cyr Tier 3, Magna Tier 3');
		expect(getRoboChimpPaidTierDisplay([], { perkTier: 4 })).toBe('Perk Tier 4');
		expect(getRoboChimpPaidTierDisplay([], { perkTier: 0 })).toBe('None');
	});

	test('computes cyr trip bonus from paid bits', () => {
		expect(getCyrTripBonus([16])).toBe(Time.Minute * 3);
		expect(getCyrTripBonus([17])).toBe(Time.Minute * 7);
		expect(getCyrTripBonus([18])).toBe(Time.Minute * 11);
		expect(getCyrTripBonus([19])).toBe(Time.Minute * 16);
		expect(getCyrTripBonus([])).toBe(0);
	});
});
