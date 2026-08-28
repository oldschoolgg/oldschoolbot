import { Time } from '@oldschoolgg/toolkit';
import { describe, expect, test } from 'vitest';

import {
	calculateDeathChance,
	calculateDoomRunDeathChance,
	calculateDoomTripDuration,
	calculateDoomWipeChanceBeforeTarget,
	calculateDoomXP,
	calculateDoomZcbBoltsNeeded,
	normaliseDoomWaveCompletions,
	selectDoomMeleePunishWeapon,
	selectDoomVenomProtection
} from '@/lib/doomOfMokhaiotlHelpers.js';

function fixedDurationRollRng(roll: number): RNGProvider {
	return {
		randFloat(min: number, max: number) {
			if (min === 0 && max === 1) return roll;
			return min + (max - min) * roll;
		},
		randInt(min: number) {
			return min;
		},
		percentChance() {
			return false;
		},
		roll() {
			return false;
		}
	} as unknown as RNGProvider;
}

describe('Doom of Mokhaiotl', () => {
	test('uses the configured base death chance table', () => {
		const expectedChances = [5, 10, 15, 20, 25, 30, 50, 75, 77, 79, 81, 82, 83, 85, 87];

		for (const [index, chance] of expectedChances.entries()) {
			expect(calculateDeathChance(index + 1, 0, 0, false)).toBe(chance);
		}
	});

	test('early waves become safe only after enough successful clears', () => {
		expect(calculateDeathChance(1, 0, 0, false, { 1: 1 })).toBe(0);
		expect(calculateDeathChance(2, 0, 0, false, { 2: 1 })).toBe(10);
		expect(calculateDeathChance(2, 0, 0, false, { 2: 2 })).toBe(0);
		expect(calculateDeathChance(7, 0, 0, false, { 7: 6 })).toBe(50);
		expect(calculateDeathChance(7, 0, 0, false, { 7: 7 })).toBe(0);
	});

	test('wave 8 and above never become permanently safe', () => {
		expect(calculateDeathChance(8, 0, 0, false)).toBe(75);
		expect(calculateDeathChance(8, 0, 0, false, { 8: 100 })).toBeGreaterThan(0);
		expect(calculateDeathChance(8, 0, 0, false, { 8: 100 })).toBeLessThan(75);
	});

	test('wave completion learning bottoms out at the configured Masori death chances', () => {
		const expectedLowestWithMasori = [
			[8, 3],
			[9, 5],
			[10, 7],
			[11, 9],
			[12, 11],
			[13, 13],
			[14, 15],
			[15, 17],
			[16, 20],
			[30, 20]
		];

		for (const [wave, chance] of expectedLowestWithMasori) {
			expect(calculateDeathChance(wave, 0, 0, true, { [wave]: 10 })).toBeCloseTo(chance, 5);
			expect(calculateDeathChance(wave, 0, 0, false, { [wave]: 10 })).toBeCloseTo(chance + 2, 5);
			expect(calculateDeathChance(wave, 0, 0, true, { [wave]: 9 })).toBeGreaterThan(chance);
		}
	});

	test('deep delve count no longer reduces wave death chance without wave completions', () => {
		expect(calculateDeathChance(8, 0, 0, true)).toBe(calculateDeathChance(8, 500, 1500, true));
		expect(calculateDeathChance(16, 0, 0, true)).toBe(calculateDeathChance(16, 500, 1500, true));
	});

	test('Masori still reduces non-learned death chances', () => {
		expect(calculateDeathChance(7, 0, 0, true)).toBe(48);
		expect(calculateDeathChance(8, 0, 0, true)).toBe(73);
	});

	test('calculates the chance to die before completing the target delve', () => {
		const result = calculateDoomRunDeathChance([50, 50]);

		expect(result.deathChance).toBe(75);
		expect(result.expectedDeathWave).toBeCloseTo(1.33, 2);
	});

	test('calculates wipe chance before the target delve separately from target death chance', () => {
		expect(calculateDoomWipeChanceBeforeTarget([50])).toBe(0);
		expect(calculateDoomWipeChanceBeforeTarget([3, 5, 7, 9])).toBeCloseTo(14.3, 2);
	});

	test('max gear Doom durations average around 1-8 speed targets', () => {
		const maxGearArgs = [true, false, true, false, 'noxious_halberd', true, false, true, -0.08] as const;
		const maxKcAndStatsDurationMultiplier = 0.9 * 0.85;
		const normalDuration =
			calculateDoomTripDuration(8, ...maxGearArgs, fixedDurationRollRng(0.525)) * maxKcAndStatsDurationMultiplier;
		const speedDuration =
			calculateDoomTripDuration(8, ...maxGearArgs, fixedDurationRollRng(0.025)) * maxKcAndStatsDurationMultiplier;
		const extraDeepWaveDuration =
			(calculateDoomTripDuration(9, ...maxGearArgs, fixedDurationRollRng(0.525)) -
				calculateDoomTripDuration(8, ...maxGearArgs, fixedDurationRollRng(0.525))) *
			maxKcAndStatsDurationMultiplier;

		expect(normalDuration).toBeGreaterThanOrEqual(Time.Minute * 8.5);
		expect(normalDuration).toBeLessThanOrEqual(Time.Minute * 9);
		expect(speedDuration).toBeLessThan(Time.Minute * 7.25);
		expect(extraDeepWaveDuration).toBeGreaterThanOrEqual(Time.Minute * 1.25);
		expect(extraDeepWaveDuration).toBeLessThanOrEqual(Time.Minute * 1.33);
	});

	test('Lightbearer gives a Doom speed boost', () => {
		const withoutLightbearer = calculateDoomTripDuration(
			8,
			true,
			false,
			false,
			false,
			'dual_macuahuitl',
			false,
			false,
			false,
			-0.08,
			fixedDurationRollRng(0.525)
		);
		const withLightbearer = calculateDoomTripDuration(
			8,
			true,
			false,
			false,
			true,
			'dual_macuahuitl',
			false,
			false,
			false,
			-0.08,
			fixedDurationRollRng(0.525)
		);

		expect(withLightbearer).toBeLessThan(withoutLightbearer);
		expect(withLightbearer / withoutLightbearer).toBeCloseTo(0.8 / 0.82, 5);
	});

	test('selects the best available melee punish weapon without blocking Dual macuahuitl fallback', () => {
		expect(
			selectDoomMeleePunishWeapon({
				hasNoxHalberd: true,
				hasCrystalHalberd: true,
				hasDualMacuahuitl: true,
				crystalShardsOwned: 0,
				crystalShardsNeeded: 9
			})
		).toBe('noxious_halberd');
		expect(
			selectDoomMeleePunishWeapon({
				hasNoxHalberd: false,
				hasCrystalHalberd: true,
				hasDualMacuahuitl: true,
				crystalShardsOwned: 0,
				crystalShardsNeeded: 9
			})
		).toBe('dual_macuahuitl');
		expect(
			selectDoomMeleePunishWeapon({
				hasNoxHalberd: false,
				hasCrystalHalberd: true,
				hasDualMacuahuitl: false,
				crystalShardsOwned: 9,
				crystalShardsNeeded: 9
			})
		).toBe('crystal_halberd');
		expect(
			selectDoomMeleePunishWeapon({
				hasNoxHalberd: false,
				hasCrystalHalberd: false,
				hasDualMacuahuitl: false,
				crystalShardsOwned: 0,
				crystalShardsNeeded: 9
			})
		).toBeNull();
	});

	test('normalises stored wave completions', () => {
		expect(normaliseDoomWaveCompletions({ 1: 1, 2: 2, 31: 1, bad: 5, 4: -1 })).toEqual({ 1: 1, 2: 2 });
	});

	test('ZCB bolt usage is about half the raw first-9 and post-9 curve before Ava reduction', () => {
		expect(calculateDoomZcbBoltsNeeded(1)).toBe(3);
		expect(calculateDoomZcbBoltsNeeded(9)).toBe(3);
		expect(calculateDoomZcbBoltsNeeded(10)).toBe(4);
		expect(calculateDoomZcbBoltsNeeded(30)).toBe(14);
		expect(calculateDoomZcbBoltsNeeded(30, 80)).toBe(3);
	});

	test('selects one dose of Doom venom protection', () => {
		expect(selectDoomVenomProtection(itemName => (itemName === 'Anti-venom(1)' ? 1 : 0))?.option.potionName).toBe(
			'Anti-venom'
		);
		expect(selectDoomVenomProtection(itemName => (itemName === 'Anti-venom+(1)' ? 1 : 0))?.option.potionName).toBe(
			'Anti-venom+'
		);
		expect(
			selectDoomVenomProtection(itemName => (itemName === 'Extended anti-venom+(1)' ? 1 : 0))?.option.potionName
		).toBe('Extended anti-venom+');
	});

	test('returns the remaining potion dose after Doom venom protection is consumed', () => {
		const protection = selectDoomVenomProtection(itemName => (itemName === 'Anti-venom+(4)' ? 1 : 0));

		expect(protection?.itemName).toBe('Anti-venom+(4)');
		expect(protection?.consumedDoseItemName).toBe('Anti-venom+(1)');
		expect(protection?.replacementItemName).toBe('Anti-venom+(3)');
		expect(selectDoomVenomProtection(() => 0)).toBeNull();
	});

	test('awards Doom combat XP at the intended per-hour rates for a completed run', () => {
		const xpBank = calculateDoomXP({
			duration: Time.Hour,
			targetDelve: 8,
			totalWavesCleared: 8
		});

		expect(xpBank.amount('ranged')).toBe(105_000);
		expect(xpBank.amount('magic')).toBe(10_000);
		expect(xpBank.amount('attack') + xpBank.amount('strength')).toBe(5_000);
		expect(xpBank.amount('hitpoints')).toBe(40_000);
	});

	test('scales Doom combat XP down for incomplete runs', () => {
		const xpBank = calculateDoomXP({
			duration: Time.Hour,
			targetDelve: 8,
			totalWavesCleared: 4
		});

		expect(xpBank.amount('ranged')).toBe(52_500);
		expect(xpBank.amount('magic')).toBe(5_000);
		expect(xpBank.amount('attack') + xpBank.amount('strength')).toBe(2_500);
		expect(xpBank.amount('hitpoints')).toBe(20_000);
	});
});
