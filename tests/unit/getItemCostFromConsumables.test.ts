import { expect, test } from 'vitest';

import { Time } from 'e';
import killableMonsters from '../../src/lib/minions/data/killableMonsters';
import { getItemCostFromConsumables } from '../../src/mahoji/lib/abstracted_commands/minionKill/handleConsumables';
import { makeGearBank } from './utils';

test('getItemCostFromConsumables.test', () => {
	const gearBank = makeGearBank();
	gearBank.bank.add('Stamina potion(4)', 100);
	gearBank.bank.add('Ruby dragon bolts (e)', 1000);

	const monster = killableMonsters.find(m => m.name === 'Rabbit')!;
	for (const quantity of [1, 2, 5, 100]) {
		const consumablesCost = getItemCostFromConsumables({
			consumableCosts: [monster.itemCost!],
			gearBank,
			quantity,
			timeToFinish: monster.timeToFinish,
			maxTripLength: Time.Hour
		});
		expect(consumablesCost?.itemCost.amount('Stamina potion(4)')).toEqual(1 * 5);
		expect(consumablesCost?.itemCost.amount('Ruby dragon bolts (e)')).toEqual(1 * 100);
		expect(consumablesCost?.finalQuantity).toEqual(1);
	}

	const skotizo = killableMonsters.find(m => m.name === 'Skotizo')!;
	const gearBank2 = makeGearBank();
	gearBank2.bank.add('Dark totem', 10);
	const consumablesCost2 = getItemCostFromConsumables({
		consumableCosts: [skotizo.itemCost!],
		gearBank: gearBank2,
		quantity: 5,
		timeToFinish: skotizo.timeToFinish,
		maxTripLength: Time.Hour
	});
	expect(consumablesCost2?.itemCost.amount('Dark totem')).toEqual(5);
	expect(consumablesCost2?.finalQuantity).toEqual(5);
});
