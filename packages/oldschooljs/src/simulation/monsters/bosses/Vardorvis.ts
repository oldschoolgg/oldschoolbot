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
	.add("Executioner's axe head", 1, 1)
	.add('Ultor vestige', 1, 1);

const ClueTable = new LootTable()
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)');

const SupplyTable = new LootTable()
	.every('Tuna potato', [3, 4])
	.every('Prayer potion(3)')
	.every('Super combat potion(2)');

const ResourceTable = new LootTable()
	.add('Coal', [130, 195], 8)
	.add('Adamantite ore', [45, 67], 8)
	.add('Rune javelin heads', [36, 54], 8)
	.add('Dragon javelin heads', [36, 54], 8)
	.add('Uncut ruby', [25, 37], 5)
	.add('Uncut diamond', [25, 37], 5)
	.add('Runite ore', [18, 27], 2)
	.add('Dragon dart tip', [100, 150], 2)
	.add('Pure essence', [120, 180], 1)
	.add('Iron ore', [38, 57], 1)
	.add('Silver ore', [38, 57], 1)
	.add('Mithril ore', [38, 57], 1)
	.add('Sapphire', [17, 25], 1)
	.add('Emerald', [17, 25], 1)
	.add('Ruby', [17, 25], 1)
	.add('Raw shark', [200, 300], 1)

	.add('Onyx bolts (e)', [60, 90], 1)
	.add('Bronze javelin', [42, 63], 1)
	.add('Mithril javelin', [42, 63], 1)
	.add('Adamant javelin', [42, 63], 1)
	.add('Mind rune', [120, 180], 1)
	.add('Fire rune', [120, 180], 1)
	.add('Lava rune', [200, 300], 8)
	.add('Blood rune', [200, 300], 8)
	.add('Soul rune', [400, 600], 2);

class VardorvisSingleton extends Monster {
	public allItems: number[] = uniqueArr([
		...ClueTable.allItems,
		...SupplyTable.allItems,
		...ResourceTable.allItems,
		...TradeableUniqueTable.allItems,
		itemID("Awakener's orb"),
		itemID('Blood quartz'),
		itemID('Butch')
	]);

	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const tradeableUniqueCap = options.isAwakened ? 3 : 1;
			if (randInt(1, 136) <= tradeableUniqueCap) {
				loot.add(TradeableUniqueTable.roll());
			} else if (roll(48)) {
				loot.add("Awakener's orb");
			} else if (roll(200)) {
				loot.add('Blood quartz');
			} else if (roll(5)) {
				loot.add(SupplyTable.roll());
			} else {
				loot.add(ResourceTable.roll());
			}

			if (roll(40)) {
				loot.add(ClueTable.roll());
			}
			if (roll(3000)) {
				loot.add('Butch');
			}
		}
		return loot;
	}
}

export const Vardorvis = new VardorvisSingleton({
	id: 12_223,
	name: 'Vardorvis',
	aliases: ['vardorvis']
});
