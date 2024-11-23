import { roll } from 'e';

import type { MonsterKillOptions } from '../../../meta/types';
import Bank from '../../../structures/Bank';
import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/Monster';

const HesporiTable = new LootTable()
	.add('Attas seed', [1, 2], 1)
	.add('Iasor seed', [1, 2], 1)
	.add('Kronos seed', [1, 2], 1);

const MainTable = new LootTable()
	.every(HesporiTable)

	// Pre-roll for bucket
	.oneIn(35, 'Bottomless compost bucket')

	// Allotment seeds
	.add('Watermelon seed', [10, 20], 2)
	.add('Snape grass seed', [6, 16], 2)

	// Flower seeds
	.add('White lily seed', [8, 18], 5)
	.add('Limpwurt seed', [6, 14], 2)

	// Hop seeds
	.add('Wildblood seed', [10, 20], 2)

	// Bush seeds
	.add('Whiteberry seed', [10, 16], 2)
	.add('Poison ivy seed', [8, 16], 2)

	// Herb seeds
	.add('Irit seed', [2, 8], 3)
	.add('Avantoe seed', [2, 5], 3)
	.add('Kwuarm seed', [2, 5], 3)
	.add('Toadflax seed', [2, 5], 3)
	.add('Cadantine seed', [2, 5], 3)
	.add('Lantadyme seed', [2, 5], 3)
	.add('Dwarf weed seed', [2, 5], 3)
	.add('Ranarr seed', [1, 2], 2)
	.add('Snapdragon seed', 1, 2)
	.add('Torstol seed', 1, 2)

	// Tree seeds
	.add('Maple seed', [2, 4], 4)
	.add('Willow seed', [2, 5], 3)
	.add('Yew seed', 1, 2)
	.add('Magic seed', 1, 1)

	// Fruit tree seeds
	.add('Pineapple seed', [3, 6], 3)
	.add('Papaya tree seed', [1, 3], 3)
	.add('Palm tree seed', [1, 3], 3)
	.add('Dragonfruit tree seed', 1, 2)

	// Special seeds
	.add('Teak seed', [2, 5], 4)
	.add('Mahogany seed', [1, 3], 3)
	.add('Cactus seed', [4, 14], 2)
	.add('Potato cactus seed', [4, 14], 2)
	.add('Celastrus seed', 1, 2)
	.add('Spirit seed', 1, 1)
	.add('Redwood tree seed', 1, 1);

export class Hespori extends SimpleMonster {
	public kill(quantity = 1, options: MonsterKillOptions = { farmingLevel: 99 }): Bank {
		const loot = new Bank();
		const farmingLvl = options.farmingLevel ?? 99;

		for (let i = 0; i < quantity; i++) {
			loot.add(MainTable.roll());
			if (roll(7000 - farmingLvl * 25)) loot.add('Tangleroot');
		}
		return loot;
	}
}

export default new Hespori({ id: 8583, name: 'Hespori', aliases: ['hespori'] });
