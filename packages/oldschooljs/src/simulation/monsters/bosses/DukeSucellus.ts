import { randInt, roll, uniqueArr } from 'e';

import type { MonsterKillOptions } from '../../../meta/types';
import Bank from '../../../structures/Bank';
import LootTable from '../../../structures/LootTable';
import Monster from '../../../structures/Monster';
import itemID from '../../../util/itemID';
import { VirtusTable } from '../../subtables/VirtusTable';

const TradeableUniqueTable = new LootTable({ limit: 8 })
	.add(VirtusTable, 1, 1)
	.add('Chromium ingot', 1, 3)
	.add('Eye of the duke', 1, 1)
	.add('Magus vestige', 1, 1);

const ClueTable = new LootTable()
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)');

const SupplyTable = new LootTable()
	.every('Pineapple pizza', [3, 4])
	.every('Prayer potion(3)')
	.every('Super combat potion(2)');

const ResourceTable = new LootTable()
	.add('Bronze chainbody', [11, 17], 1)
	.add('Mithril chainbody', [5, 7], 1)
	.add('Adamant chainbody', [6, 10], 1)
	.add('Dragon platelegs', [5, 7], 1)

	.add('Pure essence', [200, 300], 1)
	.add('Iron ore', [63, 95], 1)
	.add('Coal', [216, 325], 8)
	.add('Mithril ore', [33, 50], 1)
	.add('Adamantite ore', [75, 112], 8)
	.add('Runite ore', [30, 45], 2)

	.add('Sapphire', [28, 42], 1)
	.add('Emerald', [28, 42], 1)
	.add('Ruby', [28, 42], 1)
	.add('Uncut ruby', [41, 62], 5)
	.add('Uncut diamond', [41, 62], 5)

	.add('Bronze bar', [41, 62], 1)
	.add('Dragon arrowtips', [166, 255], 1)
	.add('Rune javelin heads', [60, 90], 8)
	.add('Dragon javelin heads', [60, 90], 8)
	.add('Raw sea turtle', [200, 300], 1)

	.add('Air rune', [200, 300], 1)
	.add('Mist rune', [100, 150], 8)
	.add('Chaos rune', [100, 150], 9)
	.add('Soul rune', [666, 1000], 2);

class DukeSucellusSingleton extends Monster {
	public allItems: number[] = uniqueArr([
		...ClueTable.allItems,
		...SupplyTable.allItems,
		...ResourceTable.allItems,
		...TradeableUniqueTable.allItems,
		itemID("Awakener's orb"),
		itemID('Ice quartz'),
		itemID('Baron')
	]);

	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const tradeableUniqueCap = options.isAwakened ? 3 : 1;
			if (randInt(1, 90) <= tradeableUniqueCap) {
				loot.add(TradeableUniqueTable.roll());
			} else if (roll(48)) {
				loot.add("Awakener's orb");
			} else if (roll(200)) {
				loot.add('Ice quartz');
			} else if (roll(5)) {
				loot.add(SupplyTable.roll());
			} else {
				loot.add(ResourceTable.roll());
			}

			if (roll(40)) {
				loot.add(ClueTable.roll());
			}
			if (roll(2500)) {
				loot.add('Baron');
			}
		}
		return loot;
	}
}

export const DukeSucellus = new DukeSucellusSingleton({
	id: 12_191,
	name: 'Duke Sucellus',
	aliases: ['duke sucellus']
});
