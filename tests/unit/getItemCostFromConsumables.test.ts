import { Time } from '@oldschoolgg/toolkit';
import { Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { getItemCostFromConsumables } from '../../src/mahoji/lib/abstracted_commands/minionKill/handleConsumables.js';
import { makeGearBank } from './utils.js';

describe('getItemCostFromConsumables', () => {
	test('getItemCostFromConsumables', () => {
		const gearBank = makeGearBank();
		gearBank.bank.add('Stamina potion(4)', 100);
		gearBank.bank.add('Ruby dragon bolts (e)', 1000);

		const monster = killableMonsters.find(m => m.name === 'Rabbit')!;
		const monsterItemCost = monster.itemCost;
		if (!monsterItemCost) {
			throw new Error('Expected Rabbit to have an item cost defined.');
		}
		for (const inputQuantity of [1, 2, 5, 100]) {
			const consumablesCost = getItemCostFromConsumables({
				consumableCosts: Array.isArray(monsterItemCost) ? monsterItemCost : [monsterItemCost],
				gearBank,
				inputQuantity,
				timeToFinish: monster.timeToFinish,
				maxTripLength: Time.Hour,
				slayerKillsRemaining: null
			});
			expect(consumablesCost?.itemCost?.amount('Stamina potion(4)')).toEqual(1 * 5);
			expect(consumablesCost?.itemCost?.amount('Ruby dragon bolts (e)')).toEqual(1 * 100);
			expect(consumablesCost?.finalQuantity).toEqual(1);
		}

		const skotizo = killableMonsters.find(m => m.name === 'Skotizo')!;
		const gearBank2 = makeGearBank();
		gearBank2.bank.add('Dark totem', 10);
		const skotizoItemCost = skotizo.itemCost;
		if (!skotizoItemCost) {
			throw new Error('Expected Skotizo to have an item cost defined.');
		}
		const consumablesCost2 = getItemCostFromConsumables({
			consumableCosts: Array.isArray(skotizoItemCost) ? skotizoItemCost : [skotizoItemCost],
			gearBank: gearBank2,
			inputQuantity: 5,
			timeToFinish: skotizo.timeToFinish,
			maxTripLength: Time.Hour,
			slayerKillsRemaining: null
		});
		expect(consumablesCost2?.itemCost?.amount('Dark totem')).toEqual(5);
		expect(consumablesCost2?.finalQuantity).toEqual(5);
	});

	test('Hydra costs should always have a anti-venom', () => {
		const gearBank = makeGearBank();
		gearBank.bank.add('Stamina potion(4)', 100);
		gearBank.bank.add('Ruby dragon bolts (e)', 1000);

		const monster = killableMonsters.find(m => m.id === Monsters.AlchemicalHydra.id)!;

		const consumablesCost2 = getItemCostFromConsumables({
			consumableCosts: [monster.itemCost as any],
			gearBank: gearBank,
			inputQuantity: 5,
			timeToFinish: monster.timeToFinish,
			maxTripLength: Time.Hour,
			slayerKillsRemaining: null
		});
		expect(consumablesCost2?.itemCost?.amount('Anti-venom+(4)') ?? 0).toBeGreaterThan(0);
	});
});
