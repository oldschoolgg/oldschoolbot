import { Bank, convertLVLtoXP, LootTable } from 'oldschooljs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import * as rng from '@oldschoolgg/rng';

import { getPlantToGrow, openSeedPack } from '@/lib/skilling/skills/farming/utils/calcFarmingContracts.js';
import { mockMUser } from './userutil.js';

describe('calcFarmingContracts', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('filters candidates by farming level and ignored plant name', () => {
		const user = mockMUser({
			skills_farming: convertLVLtoXP(60)
		});

		const randArrItemSpy = vi.spyOn(rng, 'randArrItem').mockImplementation(contractType => {
			const typedContracts = contractType as [number, string, number][];
			expect(typedContracts.every(([level]) => level <= 60)).toBe(true);
			expect(typedContracts.some(([, name]) => name === 'Rosemary')).toBe(false);
			const selection = typedContracts.find(([, name]) => name === 'Potato');
			if (!selection) {
				throw new Error('Expected Potato to remain as a candidate');
			}
			return selection as [number, string, number];
		});

		const [plantName, tier] = getPlantToGrow({
			user,
			contractLevel: 'easy',
			ignorePlant: 'Rosemary'
		});

		expect(randArrItemSpy).toHaveBeenCalled();
		expect(plantName).toBe('Potato');
		expect(tier).toBe(1);
	});

	it('selects an easy contract plant when the user meets requirements', () => {
		const user = mockMUser({
			skills_farming: convertLVLtoXP(60)
		});

		vi.spyOn(rng, 'randArrItem').mockReturnValue([45, 'Potato', 1]);

		const [plantName, tier] = getPlantToGrow({
			user,
			contractLevel: 'easy',
			ignorePlant: null
		});

		expect(plantName).toBe('Potato');
		expect(tier).toBe(1);
	});

	it('respects the requested difficulty when picking a plant', () => {
		const user = mockMUser({
			skills_farming: convertLVLtoXP(90)
		});

		vi.spyOn(rng, 'randArrItem').mockReturnValue([85, 'Palm tree', 4]);

		const [plantName, tier] = getPlantToGrow({
			user,
			contractLevel: 'medium',
			ignorePlant: 'Jangerberry'
		});

		expect(plantName).toBe('Palm tree');
		expect(tier).toBe(4);
	});

	it('throws when there is no suitable plant for the players level', () => {
		const user = mockMUser({
			skills_farming: convertLVLtoXP(1)
		});

		expect(() =>
			getPlantToGrow({
				user,
				contractLevel: 'hard',
				ignorePlant: null
			})
		).toThrow();
	});

	it('openSeedPack tiers 0 and 1 use the expected medium and low rolls', () => {
		const randIntSpy = vi.spyOn(rng, 'randInt').mockReturnValue(2);
		vi.spyOn(rng, 'roll').mockReturnValue(false);
		const everySpy = vi.spyOn(LootTable.prototype, 'every');
		vi.spyOn(LootTable.prototype, 'roll').mockReturnValue(
			new Bank() as unknown as ReturnType<(typeof LootTable.prototype)['roll']>
		);

		const run = (tier: number) => {
			everySpy.mockClear();
			openSeedPack(tier);
			return everySpy.mock.calls.map(call => call[1]);
		};

		expect(run(0)).toEqual([4, 2, 0]);
		expect(randIntSpy).toHaveBeenCalledWith(1, 3);
		expect(run(1)).toEqual([4, 2, 0]);
	});

	it('openSeedPack tier 2 can award a high seed when the roll succeeds', () => {
		vi.spyOn(rng, 'randInt').mockReturnValue(3);
		vi.spyOn(rng, 'roll').mockReturnValue(true);
		const everySpy = vi.spyOn(LootTable.prototype, 'every');
		vi.spyOn(LootTable.prototype, 'roll').mockReturnValue(
			new Bank() as unknown as ReturnType<(typeof LootTable.prototype)['roll']>
		);

		openSeedPack(2);

		const [[, low], [, medium], [, high]] = everySpy.mock.calls;
		expect(low).toBe(3);
		expect(medium).toBe(3);
		expect(high).toBe(1);
	});

	it('openSeedPack tier 3 uses separate random rolls for high and medium counts', () => {
		const randIntSpy = vi.spyOn(rng, 'randInt');
		randIntSpy.mockImplementationOnce(() => 1).mockImplementationOnce(() => 4);
		vi.spyOn(rng, 'roll').mockReturnValue(false);
		const everySpy = vi.spyOn(LootTable.prototype, 'every');
		vi.spyOn(LootTable.prototype, 'roll').mockReturnValue(
			new Bank() as unknown as ReturnType<(typeof LootTable.prototype)['roll']>
		);

		openSeedPack(3);

		const [[, low], [, medium], [, high]] = everySpy.mock.calls;
		expect(high).toBe(1);
		expect(medium).toBe(4);
		expect(low).toBe(3);
	});

	it('openSeedPack tier 4 scales the distribution for higher tiers', () => {
		const randIntSpy = vi.spyOn(rng, 'randInt');
		randIntSpy.mockImplementationOnce(() => 2).mockImplementationOnce(() => 5);
		vi.spyOn(rng, 'roll').mockReturnValue(false);
		const everySpy = vi.spyOn(LootTable.prototype, 'every');
		vi.spyOn(LootTable.prototype, 'roll').mockReturnValue(
			new Bank() as unknown as ReturnType<(typeof LootTable.prototype)['roll']>
		);

		openSeedPack(4);

		const [[, low], [, medium], [, high]] = everySpy.mock.calls;
		expect(low).toBe(2);
		expect(medium).toBe(5);
		expect(high).toBe(2);
	});

	it('openSeedPack tier 5 has the largest possible distribution', () => {
		const randIntSpy = vi.spyOn(rng, 'randInt');
		randIntSpy.mockImplementationOnce(() => 3).mockImplementationOnce(() => 6);
		vi.spyOn(rng, 'roll').mockReturnValue(false);
		const everySpy = vi.spyOn(LootTable.prototype, 'every');
		vi.spyOn(LootTable.prototype, 'roll').mockReturnValue(
			new Bank() as unknown as ReturnType<(typeof LootTable.prototype)['roll']>
		);

		openSeedPack(5);

		const [[, low], [, medium], [, high]] = everySpy.mock.calls;
		expect(low).toBe(1);
		expect(medium).toBe(6);
		expect(high).toBe(3);
	});
});
