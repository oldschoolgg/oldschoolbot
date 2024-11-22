import { randInt, roll, uniqueArr } from 'e';

import type { MonsterKillOptions } from '../../../meta/types';
import Bank from '../../../structures/Bank';
import LootTable from '../../../structures/LootTable';
import Monster from '../../../structures/Monster';
import { itemID } from '../../../util';
import { VirtusTable } from '../../subtables/VirtusTable';

const TradeableUniqueTable = new LootTable({ limit: 8 })
	.add(VirtusTable, 1, 1)
	.add('Chromium ingot', 1, 3)
	.add("Siren's staff", 1, 1)
	.add('Bellator vestige', 1, 1);

const ClueTable = new LootTable()
	.add('Clue scroll (easy)')
	.add('Clue scroll (medium)')
	.add('Clue scroll (hard)')
	.add('Clue scroll (elite)');

const SupplyTable = new LootTable()
	.every('Manta ray', [3, 4])
	.every('Prayer potion(3)', [1, 1])
	.every('Ancient brew(2)', 1);

const ResourceTable = new LootTable()
	.add('Battlestaff', [70, 105], 2)
	.add('Bronze longsword', [16, 24], 1)
	.add('Mithril longsword', [7, 10], 1)
	.add('Adamant longsword', [9, 14], 1)
	.add('Dragon plateskirt', [7, 10], 1)

	.add('Coal', [303, 455], 8)
	.add('Adamantite ore', [105, 157], 8)
	.add('Dragon javelin heads', [84, 126], 8)
	.add('Runite bolts (unf)', [84, 126], 8)
	.add('Uncut ruby', [58, 87], 5)
	.add('Uncut diamond', [58, 87], 5)
	.add('Runite ore', [42, 63], 2)
	.add('Pure essence', [280, 420], 1)
	.add('Iron ore', [88, 133], 1)
	.add('Gold ore', [88, 133], 1)
	.add('Mithril ore', [88, 133], 1)
	.add('Sapphire', [39, 59], 1)
	.add('Emerald', [39, 59], 1)
	.add('Ruby', [39, 59], 1)
	.add('Raw monkfish', [700, 1050], 1)

	.add('Steam rune', [466, 700], 8)
	.add('Death rune', [466, 700], 8)
	.add('Soul rune', [933, 1400], 2)
	.add('Water rune', [280, 420], 1)
	.add('Chaos rune', [140, 210], 1);

class TheWhispererSingleton extends Monster {
	public allItems: number[] = uniqueArr([
		...ClueTable.allItems,
		...SupplyTable.allItems,
		...ResourceTable.allItems,
		...TradeableUniqueTable.allItems,
		itemID("Awakener's orb"),
		itemID('Shadow quartz'),
		itemID('Wisp')
	]);

	public kill(quantity = 1, options: MonsterKillOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const tradeableUniqueCap = options.isAwakened ? 3 : 1;
			if (randInt(1, 64) <= tradeableUniqueCap) {
				loot.add(TradeableUniqueTable.roll());
			} else if (roll(34)) {
				loot.add("Awakener's orb");
			} else if (roll(200)) {
				loot.add('Shadow quartz');
			} else if (roll(5)) {
				loot.add(SupplyTable.roll());
			} else {
				loot.add(ResourceTable.roll());
			}

			if (roll(40)) {
				loot.add(ClueTable.roll());
			}
			if (roll(2000)) {
				loot.add('Wisp');
			}
		}
		return loot;
	}
}

export const TheWhisperer = new TheWhispererSingleton({
	id: 12_204,
	name: 'The Whisperer',
	aliases: ['the whisperer', 'whisperer']
});
