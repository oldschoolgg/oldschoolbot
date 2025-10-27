import * as rng from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, Monsters } from 'oldschooljs';
import { describe, expect, test, vi } from 'vitest';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { getItemCostFromConsumables } from '../../src/mahoji/lib/abstracted_commands/minionKill/handleConsumables.js';
import { makeGearBank } from './utils.js';

describe('getItemCostFromConsumables', () => {
	test('scales per kill and clamps by time and bank (Skotizo)', () => {
		const skotizo = killableMonsters.find(m => m.name === 'Skotizo')!;
		const gearBank = makeGearBank();

		// Bank has only 7 Dark totems, so even if time allows more kills,
		// we should clamp to 7 by availability.
		gearBank.bank.add('Dark totem', 7);

		const timeToFinish = skotizo.timeToFinish;
		const maxTripLength = Time.Hour;
		const maxByTime = Math.floor(maxTripLength / timeToFinish);

		// Ask for a lot to exercise all clamps.
		const inputQuantity = 50;

		const res = getItemCostFromConsumables({
			consumableCosts: Array.isArray(skotizo.itemCost!) ? skotizo.itemCost : [skotizo.itemCost!],
			gearBank,
			inputQuantity,
			timeToFinish,
			maxTripLength,
			slayerKillsRemaining: null
		});

		// Final quantity is clamped by both time and available Dark totems.
		const expectedQuantity = Math.min(inputQuantity, maxByTime, 7);

		expect(res?.finalQuantity).toEqual(expectedQuantity);
		expect(res?.itemCost!.amount('Dark totem')).toEqual(expectedQuantity);
	});

	test('Skotizo consumes Dark totem per kill (subject to bank availability)', () => {
		const skotizo = killableMonsters.find(m => m.name === 'Skotizo')!;
		const gearBank2 = makeGearBank();
		gearBank2.bank.add('Dark totem', 10);

		const consumablesCost2 = getItemCostFromConsumables({
			consumableCosts: Array.isArray(skotizo.itemCost!) ? skotizo.itemCost : [skotizo.itemCost!],
			gearBank: gearBank2,
			inputQuantity: 5,
			timeToFinish: skotizo.timeToFinish,
			maxTripLength: Time.Hour,
			slayerKillsRemaining: null
		});

		expect(consumablesCost2?.finalQuantity).toEqual(5);
		expect(consumablesCost2?.itemCost!.amount('Dark totem')).toEqual(5);
	});

	test('Hydra costs should always include an Anti-venom', () => {
		const gearBank = makeGearBank();
		gearBank.bank.add('Stamina potion(4)', 100);
		gearBank.bank.add('Ruby dragon bolts (e)', 1000);

		const hydra = killableMonsters.find(m => m.id === Monsters.AlchemicalHydra.id)!;

		const consumablesCost = getItemCostFromConsumables({
			consumableCosts: [hydra.itemCost as any],
			gearBank,
			inputQuantity: 5,
			timeToFinish: hydra.timeToFinish,
			maxTripLength: Time.Hour,
			slayerKillsRemaining: null
		});

		// Name matches OSJS item name database for the (4)-dose variant:
		expect(consumablesCost!.itemCost!.amount('Anti-venom+(4)')).toBeGreaterThan(0);
	});

	test('qtyPerKillRange rolls random values per kill', () => {
		const spy = vi.spyOn(rng, 'randInt');
		spy
			// rolls for each kill:
			.mockImplementationOnce(() => 8)
			.mockImplementationOnce(() => 9)
			.mockImplementationOnce(() => 12);

		const gearBank = makeGearBank();
		gearBank.bank.add('Blood rune', 1000);

		const consumablesCost = getItemCostFromConsumables({
			consumableCosts: [
				{
					itemCost: new Bank().add('Blood rune', 3),
					qtyPerKillRange: [8, 12],
					isRuneCost: true
				}
			],
			gearBank,
			inputQuantity: 3,
			timeToFinish: Time.Minute,
			maxTripLength: Time.Minute * 10,
			slayerKillsRemaining: null
		});

		expect(spy).toHaveBeenCalledTimes(3);
		// Rolls: 8 + 9 + 12 = 29  -> 29 * 3 blood runes = 87
		expect(consumablesCost?.itemCost!.amount('Blood rune')).toEqual(87);
		expect(consumablesCost?.finalQuantity).toEqual(3);

		spy.mockRestore();
	});

	test('qtyPerKillRange respects rune reductions', () => {
		const spy = vi.spyOn(rng, 'randInt').mockImplementation(() => 12);

		const gearBank = makeGearBank();
		gearBank.gear.mage.equip('Kodai wand');
		gearBank.bank.add('Blood rune', 1000);

		const consumablesCost = getItemCostFromConsumables({
			consumableCosts: [
				{
					itemCost: new Bank().add('Blood rune', 3),
					qtyPerKillRange: [8, 12],
					isRuneCost: true
				}
			],
			gearBank,
			inputQuantity: 2,
			timeToFinish: Time.Minute,
			maxTripLength: Time.Minute * 10,
			slayerKillsRemaining: null
		});

		expect(spy).toHaveBeenCalledTimes(2);
		// Kodai = 15% reduction, rounded up **once at the end**:
		// (12 + 12) * 0.85 = 20.4 -> ceil = 21  -> 21 * 3 = 63
		expect(consumablesCost?.itemCost!.amount('Blood rune')).toEqual(63);
		expect(consumablesCost?.finalQuantity).toEqual(2);

		spy.mockRestore();
	});
});
