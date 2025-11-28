import { randInt, roll } from '@oldschoolgg/rng';

import { EItem } from '@/EItem.js';
import { VirtusTable } from '@/simulation/subtables/VirtusTable.js';
import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { Monster } from '@/structures/Monster.js';
import { uniqueArr } from '@/util/smallUtils.js';

const TradeableUniqueTable = new LootTable({ limit: 8 })
	.add(VirtusTable, 1, 1)
	.add('Chromium ingot', 1, 3)
	.add('Venator vestige', 1, 1)
	.add("Leviathan's lure", 1, 1);

const ClueTable: LootTable = new LootTable()
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)');

const SupplyTable: LootTable = new LootTable()
	.every('Prayer potion(3)', 1)
	.every('Ranging potion(2)', 1)
	.every('Sea turtle', [3, 4]);

const ResourceTable: LootTable = new LootTable()
	.add('Coal', [195, 292], 8)
	.add('Gold ore', [67, 101], 8)
	.add('Dragon javelin heads', [54, 81], 8)
	.add('Anglerfish', [4, 6], 8)
	.add('Uncut ruby', [37, 56], 5)
	.add('Uncut diamond', [37, 56], 5)
	.add('Runite ore', [27, 40], 2)
	.add('Dragon bolts (unf)', [150, 225], 2)
	.add('Pure essence', [180, 270], 1)
	.add('Iron ore', [57, 85], 1)
	.add('Silver ore', [57, 85], 1)
	.add('Adamantite ore', [57, 85], 1)
	.add('Sapphire', [25, 38], 1)
	.add('Emerald', [25, 38], 1)
	.add('Ruby', [25, 38], 1)
	.add('Onyx bolt tips', [90, 135], 1)
	.add('Raw manta ray', [180, 270], 1)

	.add('Rune arrow', [54, 81], 8)
	.add('Smoke rune', [300, 450], 8)
	.add('Soul rune', [600, 900], 2)
	.add('Bronze arrow', [63, 94], 1)
	.add('Mithril arrow', [63, 94], 1)
	.add('Adamant arrow', [63, 94], 1)
	.add('Body rune', [180, 270], 1)
	.add('Earth rune', [180, 270], 1);

class TheLeviathanSingleton extends Monster {
	public override allItems: number[] = uniqueArr([
		...ClueTable.allItems,
		...SupplyTable.allItems,
		...ResourceTable.allItems,
		...TradeableUniqueTable.allItems,
		EItem.AWAKENERS_ORB,
		EItem.SMOKE_QUARTZ,
		EItem.LILVIATHAN
	]);

	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const tradeableUniqueCap = options.isAwakened ? 3 : 1;
			if (randInt(1, 96) <= tradeableUniqueCap) {
				loot.add(TradeableUniqueTable.roll());
			} else if (roll(53)) {
				loot.add("Awakener's orb");
			} else if (roll(200)) {
				loot.add('Smoke quartz');
			} else if (roll(5)) {
				loot.add(SupplyTable.roll());
			} else {
				loot.add(ResourceTable.roll());
			}

			if (roll(40)) {
				loot.add(ClueTable.roll());
			}
			if (roll(2500)) {
				loot.add("Lil'viathan");
			}
		}
		return loot;
	}
}

export const TheLeviathan: TheLeviathanSingleton = new TheLeviathanSingleton({
	id: 12_214,
	name: 'The Leviathan',
	aliases: ['the leviathan']
});
