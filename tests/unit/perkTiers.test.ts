import { formatUserPaidTiers, getCyrTripBonus, Time } from '@oldschoolgg/toolkit';
import { describe, expect, test } from 'vitest';

describe('perk tier helpers', () => {
	test('formats robochimp paid tier labels', () => {
		expect(formatUserPaidTiers([19, 10])).toBe('Cyr Tier 3, Magna Tier 3');
		expect(formatUserPaidTiers([])).toBe('None');
	});

	test('computes cyr trip bonus from paid bits', () => {
		expect(getCyrTripBonus([16])).toBe(Time.Minute * 3);
		expect(getCyrTripBonus([17])).toBe(Time.Minute * 7);
		expect(getCyrTripBonus([18])).toBe(Time.Minute * 11);
		expect(getCyrTripBonus([19])).toBe(Time.Minute * 16);
		expect(getCyrTripBonus([])).toBe(0);
	});
});
