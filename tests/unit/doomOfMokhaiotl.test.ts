import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import {
	calculateDeathChance,
	calculateDoomRunDeathChance,
	calculateDoomTripDuration,
	calculateDoomWipeChanceBeforeTarget,
	calculateDoomXP,
	calculateDoomZcbBoltsNeeded,
	normaliseDoomWaveCompletions,
	scaleDoomDurationForCompletedDelves,
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
		const expectedChances = [3, 8, 13, 18, 23, 28, 48, 73, 75, 77, 79, 80, 81, 83, 85];

		for (const [index, chance] of expectedChances.entries()) {
			expect(calculateDeathChance(index + 1)).toBe(chance);
		}
	});

	test('early waves become safe only after enough successful clears', () => {
		expect(calculateDeathChance(1, { 1: 1 })).toBe(0);
		expect(calculateDeathChance(2, { 2: 1 })).toBe(8);
		expect(calculateDeathChance(2, { 2: 2 })).toBe(0);
		expect(calculateDeathChance(7, { 7: 6 })).toBe(48);
		expect(calculateDeathChance(7, { 7: 7 })).toBe(0);
	});

	test('wave 8 and above never become permanently safe', () => {
		expect(calculateDeathChance(8)).toBe(73);
		expect(calculateDeathChance(8, { 8: 100 })).toBeGreaterThan(0);
		expect(calculateDeathChance(8, { 8: 100 })).toBeLessThan(73);
	});

	test('wave completion learning bottoms out at the configured minimum death chances', () => {
		const expectedLowestChances = [
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

		for (const [wave, chance] of expectedLowestChances) {
			expect(calculateDeathChance(wave, { [wave]: 10 })).toBeCloseTo(chance, 5);
			expect(calculateDeathChance(wave, { [wave]: 9 })).toBeGreaterThan(chance);
		}
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
		const maxGearArgs = [true, false, true, false, 'noxious_halberd', true, false, true, true, -0.08] as const;
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

	test('Doom Racer duration threshold remains reachable', () => {
		const maxKcAndStatsDurationMultiplier = 0.9 * 0.85;
		const maxGearWithLightbearer = [
			true,
			false,
			true,
			true,
			'noxious_halberd',
			true,
			false,
			true,
			true,
			-0.08
		] as const;
		const delveEightFastDuration =
			calculateDoomTripDuration(8, ...maxGearWithLightbearer, fixedDurationRollRng(0.049_999)) *
			maxKcAndStatsDurationMultiplier;

		expect(delveEightFastDuration).toBeLessThan(Time.Minute * 7.25);
	});

	test('scales early unique stop duration by completed delve weight', () => {
		const fullDuration = calculateDoomTripDuration(
			8,
			true,
			false,
			true,
			true,
			'noxious_halberd',
			true,
			false,
			true,
			true,
			-0.08,
			fixedDurationRollRng(0.525)
		);
		const stoppedDuration = scaleDoomDurationForCompletedDelves(fullDuration, 5, 8);

		expect(stoppedDuration).toBeLessThan(fullDuration);
		expect(stoppedDuration / fullDuration).toBeCloseTo(8.75 / 16.25, 5);
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
			false,
			-0.08,
			fixedDurationRollRng(0.525)
		);

		expect(withLightbearer).toBeLessThan(withoutLightbearer);
		expect(withLightbearer / withoutLightbearer).toBeCloseTo(0.8 / 0.82, 5);
	});

	test('Crystal halberd gives a fallback Doom speed boost only without Zaryte crossbow', () => {
		const baseArgs = [8, true, false, false, false] as const;
		const baseDuration = calculateDoomTripDuration(
			...baseArgs,
			'dual_macuahuitl',
			false,
			false,
			false,
			false,
			-0.08,
			fixedDurationRollRng(0.525)
		);
		const crystalHalberdDuration = calculateDoomTripDuration(
			...baseArgs,
			'crystal_halberd',
			false,
			false,
			false,
			false,
			-0.08,
			fixedDurationRollRng(0.525)
		);
		const zcbWithCrystalHalberdDuration = calculateDoomTripDuration(
			8,
			true,
			false,
			true,
			false,
			'crystal_halberd',
			false,
			false,
			false,
			false,
			-0.08,
			fixedDurationRollRng(0.525)
		);

		expect(crystalHalberdDuration).toBeLessThan(baseDuration);
		expect(crystalHalberdDuration / baseDuration).toBeCloseTo(0.79 / 0.82, 5);
		expect(zcbWithCrystalHalberdDuration / baseDuration).toBeCloseTo(0.72 / 0.82, 5);
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

	test('selects Doom venom protection based on trip duration', () => {
		expect(
			selectDoomVenomProtection(itemName => (itemName === 'Anti-venom(1)' ? 1 : 0), 30_000)?.option.potionName
		).toBe('Anti-venom');
		expect(
			selectDoomVenomProtection(itemName => (itemName === 'Anti-venom+(1)' ? 1 : 0), 3 * Time.Minute)?.option
				.potionName
		).toBe('Anti-venom+');
		expect(
			selectDoomVenomProtection(itemName => (itemName === 'Extended anti-venom+(1)' ? 1 : 0), 6 * Time.Minute)
				?.option.potionName
		).toBe('Extended anti-venom+');
	});

	test('returns the remaining potion doses after Doom venom protection is consumed', () => {
		const protection = selectDoomVenomProtection(
			itemName => (itemName === 'Anti-venom+(4)' ? 1 : 0),
			7 * Time.Minute
		);

		expect(protection?.itemCost.equals(new Bank().add('Anti-venom+(4)'))).toBe(true);
		expect(protection?.effectiveCost.equals(new Bank().add('Anti-venom+(1)', 2))).toBe(true);
		expect(protection?.replacementItems.equals(new Bank().add('Anti-venom+(2)'))).toBe(true);
	});

	test('uses multiple vials when a Doom trip needs several venom protection doses', () => {
		const protection = selectDoomVenomProtection(itemName => {
			if (itemName === 'Anti-venom+(4)') return 1;
			if (itemName === 'Anti-venom+(2)') return 1;
			return 0;
		}, 18 * Time.Minute);

		expect(protection?.dosesNeeded).toBe(5);
		expect(protection?.itemCost.equals(new Bank().add('Anti-venom+(4)').add('Anti-venom+(2)'))).toBe(true);
		expect(protection?.effectiveCost.equals(new Bank().add('Anti-venom+(1)', 5))).toBe(true);
		expect(protection?.replacementItems.equals(new Bank().add('Anti-venom+(1)'))).toBe(true);
	});

	test('does not select Doom venom protection without enough doses for the trip', () => {
		expect(
			selectDoomVenomProtection(itemName => (itemName === 'Anti-venom+(1)' ? 1 : 0), 10 * Time.Minute)
		).toBeNull();
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
