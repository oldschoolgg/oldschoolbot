import { describe, expect, test } from 'vitest';

import {
	getCyrTripBonus,
	getPerkTierDetails,
	getPerkTierDisplay,
	getPerkTierEx,
	PerkTier,
	RoboChimpBit,
	Time
} from '../src/index.js';

describe('perk tiers', () => {
	test('formats multiple paid tiers', () => {
		expect(getPerkTierDisplay({ patreonBits: [RoboChimpBit.CyrTier3, RoboChimpBit.MagnaTier3] })).toBe(
			'Cyr Tier 3, Magna Tier 3'
		);
		expect(getPerkTierDisplay({ patreonBits: [RoboChimpBit.MagnaTier1, RoboChimpBit.CyrTier1] })).toBe(
			'Cyr Tier 1, Magna Tier 1'
		);
	});

	test('formats courtesy and empty tiers', () => {
		expect(getPerkTierDisplay({ patreonBits: [] }, { courtesyTier: PerkTier.Four })).toBe(
			'**Courtesy** __Tier 3__'
		);
		expect(getPerkTierDisplay({ patreonBits: [] })).toBe('None');
	});

	test('uses highest unexpired premium tier', () => {
		const now = 1000;
		const input = {
			patreonBits: [RoboChimpBit.MagnaTier1],
			premiumTier: 5,
			premiumExpiry: now + 10_000
		};

		expect(getPerkTierEx(input, { now })).toBe(PerkTier.Five);
		expect(getPerkTierDisplay(input, { now })).toBe('Premium __Tier 4__ - 10 seconds remaining');
	});

	test('ignores expired premium tier', () => {
		const now = 1000;
		expect(
			getPerkTierEx(
				{
					patreonBits: [RoboChimpBit.MagnaTier1],
					premiumTier: 5,
					premiumExpiry: now - 1
				},
				{ now }
			)
		).toBe(PerkTier.Two);
	});

	test('formats legacy tiers above paid tiers', () => {
		expect(getPerkTierDisplay({ patreonBits: [RoboChimpBit.MagnaTier1] }, { legacyTier: 4 })).toBe(
			'🔴 **Legacy** __Tier 3__'
		);
	});

	test('returns entitlement details', () => {
		const details = getPerkTierDetails({ patreonBits: [RoboChimpBit.CyrTier3] });
		expect(details).toEqual([
			{
				tier: PerkTier.Four,
				source: 'patreon',
				beneficiary: 'cyr',
				bit: RoboChimpBit.CyrTier3,
				patronTier: 3
			}
		]);
	});

	test('computes cyr trip bonus from paid bits', () => {
		expect(getCyrTripBonus([RoboChimpBit.CyrTier0])).toBe(Time.Minute * 3);
		expect(getCyrTripBonus([RoboChimpBit.CyrTier1])).toBe(Time.Minute * 6);
		expect(getCyrTripBonus([RoboChimpBit.CyrTier2])).toBe(Time.Minute * 10);
		expect(getCyrTripBonus([RoboChimpBit.CyrTier3])).toBe(Time.Minute * 15);
		expect(getCyrTripBonus([])).toBe(0);
	});
});
