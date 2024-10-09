import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import killableMonsters from '../../src/lib/minions/data/killableMonsters';
import { getItemCostFromConsumables } from '../../src/mahoji/lib/abstracted_commands/minionKill/handleConsumables';
import { makeGearBank } from './utils';

describe('getItemCostFromConsumables', () => {
	test('getItemCostFromConsumables', () => {
		const gearBank = makeGearBank();
		gearBank.bank.add('Stamina potion(4)', 100);
		gearBank.bank.add('Ruby dragon bolts (e)', 1000);

		const monster = killableMonsters.find(m => m.name === 'Rabbit')!;
		for (const inputQuantity of [1, 2, 5, 100]) {
			const consumablesCost = getItemCostFromConsumables({
				consumableCosts: Array.isArray(monster.itemCost!) ? monster.itemCost : [monster.itemCost!],
				gearBank,
				inputQuantity,
				timeToFinish: monster.timeToFinish,
				maxTripLength: Time.Hour,
				slayerKillsRemaining: null
			});
			expect(consumablesCost?.itemCost!.amount('Stamina potion(4)')).toEqual(1 * 5);
			expect(consumablesCost?.itemCost!.amount('Ruby dragon bolts (e)')).toEqual(1 * 100);
			expect(consumablesCost?.finalQuantity).toEqual(1);
		}

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
		expect(consumablesCost2?.itemCost!.amount('Dark totem')).toEqual(5);
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
		expect(consumablesCost2!.itemCost!.amount('Anti-venom+(4)')).toBeGreaterThan(0);
	});
});
