import { randInt, roll } from 'e';

import type { OpenableOpenOptions } from '../../meta/types';
import Bank from '../../structures/Bank';
import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const LowSeedPackTable = new LootTable()
	.add('Potato seed', [8, 12], 2)
	.add('Onion seed', [8, 12], 2)
	.add('Cabbage seed', [8, 12], 2)
	.add('Tomato seed', [8, 12], 2)
	.add('Sweetcorn seed', [8, 12], 2)
	.add('Strawberry seed', [8, 12], 2)
	.add('Barley seed', [8, 14], 2)
	.add('Hammerstone seed', [6, 8], 2)
	.add('Asgarnian seed', [6, 8], 2)
	.add('Jute seed', [8, 12], 2)
	.add('Yanillian seed', [6, 8], 2)
	.add('Krandorian seed', [6, 8], 2)
	.add('Acorn', [3, 5], 2)
	.add('Apple tree seed', [3, 5], 2)
	.add('Banana tree seed', [3, 5], 2)
	.add('Orange tree seed', [3, 5], 2)
	.add('Curry tree seed', [3, 5], 2)
	.add('Redberry seed', [6, 8], 2)
	.add('Cadavaberry seed', [6, 8], 2)
	.add('Dwellberry seed', [6, 8], 2)
	.add('Jangerberry seed', [6, 8], 2)
	.add('Marigold seed', [8, 12], 2)
	.add('Rosemary seed', [8, 12], 2)
	.add('Nasturtium seed', [8, 12], 2)
	.add('Woad seed', [8, 12], 2)
	.add('Guam seed', [3, 5], 2)
	.add('Marrentill seed', [3, 5], 2)
	.add('Tarromin seed', [3, 5], 2)
	.add('Harralander seed', [3, 5], 2)
	.add('Mushroom spore', [4, 6], 1)
	.add('Belladonna seed', [4, 6], 1);

const MediumSeedPackTable = new LootTable()
	.add('Irit seed', [2, 6], 3)
	.add('Limpwurt seed', [4, 8], 3)
	.add('Watermelon seed', [8, 12], 2)
	.add('Snape grass seed', [6, 8], 2)
	.add('Wildblood seed', [8, 12], 2)
	.add('Whiteberry seed', [6, 8], 2)
	.add('Poison ivy seed', [6, 8], 2)
	.add('Cactus seed', [2, 6], 2)
	.add('Potato cactus seed', [2, 6], 2)
	.add('Willow seed', [2, 4], 1)
	.add('Pineapple seed', [3, 5], 1)
	.add('Toadflax seed', [1, 3], 1)
	.add('Avantoe seed', [1, 3], 1)
	.add('Kwuarm seed', [1, 3], 1)
	.add('Cadantine seed', [1, 3], 1)
	.add('Lantadyme seed', [1, 3], 1)
	.add('Dwarf weed seed', [1, 3], 1)
	.add('Calquat tree seed', [3, 6], 1)
	.add('Teak seed', [1, 3], 1);

const HighSeedPackTable = new LootTable()
	.add('Papaya tree seed', [1, 3], 5)
	.add('Palm tree seed', [1, 2], 5)
	.add('Hespori seed', 1, 5)
	.add('Ranarr seed', [1, 2], 4)
	.add('Snapdragon seed', 1, 4)
	.add('Maple seed', [1, 2], 4)
	.add('Mahogany seed', [1, 2], 4)
	.add('Yew seed', 1, 3)
	.add('Dragonfruit tree seed', 1, 3)
	.add('Celastrus seed', 1, 2)
	.add('Torstol seed', 1, 2)
	.add('Magic seed', 1, 1)
	.add('Spirit seed', 1, 1)
	.add('Redwood tree seed', 1, 1);

const SeedPackTable = new LootTable().add(LowSeedPackTable).add(MediumSeedPackTable).add(HighSeedPackTable);

export class SeedPackOpenable extends SimpleOpenable {
	public open(quantity = 1, options: OpenableOpenOptions = { seedTier: '5' }) {
		const tempTable = new LootTable();
		const loot = new Bank();
		const tier = options.seedTier ?? '5';

		// Roll amount variables
		let high = 0;
		let medium = 0;
		let low = 0;

		switch (tier) {
			case '1': {
				high = 0;
				medium = randInt(1, 3);
				low = 6 - medium;
				break;
			}
			case '2': {
				if (roll(11)) {
					high = 1;
				}
				medium = randInt(2, 3);
				low = 7 - medium - high;
				break;
			}
			case '3': {
				high = randInt(0, 1);
				medium = randInt(2, 4);
				low = 8 - medium - high;
				break;
			}
			case '4': {
				high = randInt(1, 2);
				medium = randInt(3, 5);
				low = 9 - medium - high;
				break;
			}
			default: {
				high = randInt(1, 3);
				medium = randInt(4, 6);
				low = 10 - medium - high;
				break;
			}
		}
		// Low seed roll
		tempTable.every(LowSeedPackTable, low);
		// Medium seed roll
		tempTable.every(MediumSeedPackTable, medium);
		// High seed roll
		tempTable.every(HighSeedPackTable, high);

		for (let i = 0; i < quantity; i++) {
			loot.add(tempTable.roll());
		}

		return loot;
	}
}

export default new SeedPackOpenable({
	id: 22_993,
	name: 'Seed pack',
	aliases: ['seed pack'],
	table: SeedPackTable
});
