import { describe, expect, test } from 'vitest';

import {
	advanceMiscellaniaState,
	calculateMiscellaniaDays,
	calculateMiscellaniaTripSeconds,
	daysElapsedSince,
	normalizeMiscellaniaState,
	simulateDetailedMiscellania,
	validateAreas
} from '../../src/lib/miscellania/calc.js';

describe('miscellania simplified mechanics', () => {
	test('first trip defaults to 1 day', () => {
		expect(calculateMiscellaniaDays(null, 1_000_000)).toEqual(1);
	});

	test('claim days are not clamped by the top-up trip cap', () => {
		const now = 1_000_000_000;
		const state = {
			lastClaimedAt: now - 130 * 24 * 60 * 60 * 1000,
			lastUpdatedAt: now - 130 * 24 * 60 * 60 * 1000,
			lastTopupAt: now - 130 * 24 * 60 * 60 * 1000,
			primaryArea: 'maple',
			secondaryArea: 'herbs',
			coffer: 7_500_000,
			cofferAtLastClaim: 7_500_000,
			favour: 100,
			resourcePoints: 0
		} as const;
		expect(calculateMiscellaniaDays(state, now)).toEqual(130);
	});

	test('trip seconds scale by days', () => {
		expect(calculateMiscellaniaTripSeconds(3)).toEqual(45);
	});

	test('duration is clamped between 1 and 100 days', () => {
		expect(calculateMiscellaniaTripSeconds(0)).toEqual(15);
		expect(calculateMiscellaniaTripSeconds(150)).toEqual(1500);
	});

	test('daysElapsedSince floors partial days', () => {
		const now = 10_000_000;
		const twentyThreeHours = 23 * 60 * 60 * 1000;
		expect(daysElapsedSince(now - twentyThreeHours, now)).toEqual(0);
	});

	test('primary and secondary areas must differ', () => {
		expect(validateAreas('maple', 'maple')).toContain('must be different');
		expect(validateAreas('maple', 'herbs')).toBeNull();
	});

	test('prevents conflicting fishing and hardwood pairings', () => {
		expect(validateAreas('fishing_raw', 'fishing_cooked')).toContain('either Fishing (Raw) or Fishing (Cooked)');
		expect(validateAreas('mahogany', 'hardwood_both')).toContain('one hardwood mode');
	});

	test('normalizes invalid persisted areas back to defaults', () => {
		const state = normalizeMiscellaniaState({
			primaryArea: 'invalid_primary' as any,
			secondaryArea: 'invalid_secondary' as any
		});

		expect(state.primaryArea).toEqual('maple');
		expect(state.secondaryArea).toEqual('herbs');
	});

	test('days is at least 1 even if last claimed in the future', () => {
		const now = 500_000_000;
		const state = {
			lastClaimedAt: now + 2 * 24 * 60 * 60 * 1000,
			lastUpdatedAt: now + 2 * 24 * 60 * 60 * 1000,
			lastTopupAt: now + 2 * 24 * 60 * 60 * 1000,
			primaryArea: 'maple',
			secondaryArea: 'herbs',
			coffer: 7_500_000,
			cofferAtLastClaim: 7_500_000,
			favour: 100,
			resourcePoints: 0
		} as const;
		expect(calculateMiscellaniaDays(state, now)).toEqual(1);
	});

	test('detailed sim matches expected 1-day values', () => {
		const result = simulateDetailedMiscellania({
			days: 1,
			startingCoffer: 7_500_000,
			startingFavour: 100,
			constantFavour: false
		});
		expect(result.endingCoffer).toEqual(7_425_000);
		expect(result.gpSpent).toEqual(75_000);
		expect(result.resourcePoints).toEqual(900);
		expect(result.endingFavour).toEqual(97);
	});

	test('detailed sim constant favour keeps favour unchanged', () => {
		const result = simulateDetailedMiscellania({
			days: 10,
			startingCoffer: 7_500_000,
			startingFavour: 88,
			constantFavour: true
		});
		expect(result.endingFavour).toEqual(88);
	});

	test('advance progresses until the resource point cap', () => {
		const now = 1_000_000_000;
		const state = {
			lastClaimedAt: now - 300 * 24 * 60 * 60 * 1000,
			lastUpdatedAt: now - 300 * 24 * 60 * 60 * 1000,
			lastTopupAt: now - 300 * 24 * 60 * 60 * 1000,
			primaryArea: 'maple',
			secondaryArea: 'herbs',
			coffer: 7_500_000,
			cofferAtLastClaim: 7_500_000,
			favour: 100,
			resourcePoints: 0
		} as const;
		const advanced = advanceMiscellaniaState(state, now);
		const expected = simulateDetailedMiscellania({
			days: 300,
			startingCoffer: 7_500_000,
			startingFavour: 100,
			constantFavour: false
		});
		expect(advanced.coffer).toEqual(expected.endingCoffer);
		expect(advanced.resourcePoints).toEqual(expected.resourcePoints);
		expect(advanced.favour).toEqual(expected.endingFavour);

		const advancedAgain = advanceMiscellaniaState(advanced, now + 20 * 24 * 60 * 60 * 1000);
		expect(advancedAgain.coffer).toEqual(advanced.coffer);
		expect(advancedAgain.resourcePoints).toEqual(advanced.resourcePoints);
		expect(advancedAgain.favour).toEqual(advanced.favour);
	});

	test('simulation stops coffer and favour changes at the resource point cap', () => {
		const capped = simulateDetailedMiscellania({
			days: 10,
			startingCoffer: 7_500_000,
			startingFavour: 100,
			constantFavour: false,
			startingResourcePoints: 262_142
		});

		expect(capped.resourcePoints).toEqual(262_143);
		expect(capped.endingCoffer).toEqual(7_425_000);
		expect(capped.endingFavour).toEqual(97);
	});
});
