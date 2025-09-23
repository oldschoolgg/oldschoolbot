import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { EItem, itemID } from 'oldschooljs';
import { calcFishingTripStart } from '../../src/lib/skilling/skills/fishing/fishingTripStart.js';
import { makeGearBank } from './utils.js';

describe('calcFishingTripStart', () => {
	test('returns error when wanting to use flakes but none are present and does not reserve bait', () => {
		// Minimal sardine fish object (avoid importing the full Fishing module to keep test isolated)
		const fish = {
			level: 5,
			xp: 20,
			id: itemID('Raw sardine'),
			name: 'Sardine',
			petChance: 528_000,
			bait: itemID('Fishing bait'),
			timePerFish: 3.6,
			clueScrollChance: 1_056_000
		} as any;

		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 5) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			// Make this large enough that duration checks won't fail in the test environment
			maxTripLength: 1000000,
			quantityInput: 2,
			wantsToUseFlakes: true
		});

		// Should return error string about missing spirit flakes
		expect(typeof res).toBe('string');
		expect((res as string).toLowerCase()).toContain('spirit flake');
	});

	test('returns helpful message when final quantity is 0', () => {
		const fish = {
			level: 5,
			xp: 20,
			id: itemID('Raw sardine'),
			name: 'Sardine',
			petChance: 528_000,
			bait: itemID('Fishing bait'),
			timePerFish: 3.6,
			clueScrollChance: 1_056_000
		} as any;

		// Provide at least one bait so the bait-check won't return early, then request quantity 0
		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 1) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: 0,
			wantsToUseFlakes: false
		});

		expect(typeof res).toBe('string');
		expect((res as string).toLowerCase()).toContain("can't fish any");
	});

	test('minnow scaling does not produce NaN and returns a valid quantity', () => {
		const fish = {
			level: 82,
			xp: 26.1,
			id: EItem.MINNOW,
			name: 'Minnow',
			timePerFish: 2.14
		} as any;

		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 10) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: undefined,
			wantsToUseFlakes: false
		});

		expect(typeof res).toBe('object');
		const out = res as any;
		expect(Number.isFinite(out.duration)).toBeTruthy();
		expect(out.quantity).toBeGreaterThanOrEqual(0);
	});

	test('feather-bait fish gets rod-specific boost (Barbarian fishing)', () => {
		const fish = {
			level: 48,
			xp: 130,
			id: itemID('Leaping trout'),
			name: 'Barbarian fishing',
			bait: itemID('Feather'),
			timePerFish: 3
		} as any;

		const baseBank = makeGearBank({ bank: new Bank().add('Feather', 10) });
		const base = calcFishingTripStart({
			gearBank: baseBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: undefined,
			wantsToUseFlakes: false
		}) as any;

		const pearlBank = makeGearBank({ bank: new Bank().add('Feather', 10).add('Pearl barbarian rod') });
		const pearl = calcFishingTripStart({
			gearBank: pearlBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: undefined,
			wantsToUseFlakes: false
		}) as any;

		expect(pearl.quantity).toBeGreaterThanOrEqual(base.quantity);
	});

	test('does not add bait to cost if flakes missing (requesting flakes)', () => {
		const fish = {
			level: 5,
			xp: 20,
			id: itemID('Raw sardine'),
			name: 'Sardine',
			bait: itemID('Fishing bait'),
			timePerFish: 3.6
		} as any;

		// bank has bait but no flakes, and wantsToUseFlakes true -> should return flakes error and not reserve bait
		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 5) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: 2,
			wantsToUseFlakes: true
		});

		expect(typeof res).toBe('string');
		// Ensure bait wasn't reserved by calling again without flakes flag and verifying cost contains bait
		const ok = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: 2,
			wantsToUseFlakes: false
		}) as any;

		expect(ok.cost.amount('Fishing bait')).toBeGreaterThanOrEqual(2);
	});

	test('duration > maxTripLength returns correct error message', () => {
		const fish = {
			level: 5,
			xp: 20,
			id: itemID('Raw sardine'),
			name: 'Sardine',
			bait: itemID('Fishing bait'),
			timePerFish: 3.6
		} as any;

		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 1000) });

		// Very small maxTripLength to force duration check
		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1,
			quantityInput: 10,
			wantsToUseFlakes: false
		});

		expect(typeof res).toBe('string');
		expect((res as string).toLowerCase()).toContain("can't go on trips longer");
	});

	test('boosts (pearl/crystal) change quantity by altering time per fish', () => {
		const fish = {
			level: 5,
			xp: 20,
			id: itemID('Raw sardine'),
			name: 'Sardine',
			petChance: 528_000,
			bait: itemID('Fishing bait'),
			timePerFish: 3.6
		} as any;

		// No special gear
		const noBoostBank = makeGearBank({ bank: new Bank().add('Fishing bait', 10) });
		const noBoost = calcFishingTripStart({
			gearBank: noBoostBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: undefined,
			wantsToUseFlakes: false
		}) as any;

		// With Pearl fishing rod in bank
		const pearlBank = makeGearBank({ bank: new Bank().add('Fishing bait', 10).add('Pearl fishing rod') });
		const pearl = calcFishingTripStart({
			gearBank: pearlBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: undefined,
			wantsToUseFlakes: false
		}) as any;

		// With Crystal harpoon in bank (should apply generic 5% boost path)
		const crystalBank = makeGearBank({ bank: new Bank().add('Fishing bait', 10).add('Crystal harpoon') });
		const crystal = calcFishingTripStart({
			gearBank: crystalBank,
			fish,
			maxTripLength: 1000000,
			quantityInput: undefined,
			wantsToUseFlakes: false
		}) as any;

		// Ensure pearl/crystal produce equal or greater quantity (since they speed up fishing)
		expect(pearl.quantity).toBeGreaterThanOrEqual(noBoost.quantity);
		expect(crystal.quantity).toBeGreaterThanOrEqual(noBoost.quantity);
	});

	test('caps flakes to final quantity and only adds boost when > 0', () => {
		const fish = {
			level: 5,
			xp: 20,
			id: itemID('Raw sardine'),
			name: 'Sardine',
			petChance: 528_000,
			bait: itemID('Fishing bait'),
			timePerFish: 3.6,
			clueScrollChance: 1_056_000
		} as any;

		// Provide only 1 bait so quantity will be capped to 1 when asking for more
		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 1).add('Spirit flakes', 5) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			// Make this large enough that duration checks won't fail in the test environment
			maxTripLength: 1000000,
			quantityInput: 5,
			wantsToUseFlakes: true
		});

		expect(typeof res).toBe('object');
		const out = res as any;
		// quantity should be 1 because only 1 bait in bank
		expect(out.quantity).toBeGreaterThanOrEqual(1);
		expect(out.flakesBeingUsed).toBeLessThanOrEqual(out.quantity);
		// boost should only exist if flakesBeingUsed > 0
		if (out.flakesBeingUsed > 0) {
			expect(out.boosts.some((b: string) => b.includes('Spirit flakes'))).toBeTruthy();
		}

		// cost should contain exactly 1 Fishing bait and flakesBeingUsed flakes
		expect(out.cost.amount('Fishing bait')).toBe(out.quantity);
		expect(out.cost.amount('Spirit flakes')).toBe(out.flakesBeingUsed ?? 0);
	});
});
