import { randInt, roll } from '@oldschoolgg/rng';
import { uniqueArr } from '@oldschoolgg/util';

import { EItem } from '@/EItem.js';
import { VirtusTable } from '@/simulation/subtables/VirtusTable.js';
import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { Monster } from '@/structures/Monster.js';

const TradeableUniqueTable = new LootTable({ limit: 8 })
	.add(VirtusTable, 1, 1)
	.add('Chromium ingot', 1, 3)
	.add("Executioner's axe head", 1, 1)
	.add('Ultor vestige', 1, 1);

const ClueTable: LootTable = new LootTable()
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)');

const SupplyTable: LootTable = new LootTable()
	.every('Tuna potato', [3, 4])
	.every('Prayer potion(3)')
	.every('Super combat potion(2)');

const ResourceTable: LootTable = new LootTable()
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
	public override allItems: number[] = uniqueArr([
		...ClueTable.allItems,
		...SupplyTable.allItems,
		...ResourceTable.allItems,
		...TradeableUniqueTable.allItems,
		EItem.AWAKENERS_ORB,
		EItem.BLOOD_QUARTZ,
		EItem.BUTCH
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

export const Vardorvis: VardorvisSingleton = new VardorvisSingleton({
	id: 12_223,
	name: 'Vardorvis',
	aliases: ['vardorvis']
});
