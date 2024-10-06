import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import { MysteryBoxes } from '../bsoOpenables';

const RareTable = new LootTable()
	.add('Hornwood helm')
	.add('Hand fan')
	.add('Mask of balance')
	.add('Druidic wreath')
	.add('Disk of returning');

const UncommonTable = new LootTable()
	.add(RareTable)
	.add('Tiger toy')
	.add('Lion toy')
	.add('Snow leopard toy')
	.add('Amur leopard toy')
	.add('Holy handegg')
	.add('Peaceful handegg')
	.add('Chaotic handegg')
	.add('Rainbow scarf')
	.add("Diango's claws");

const CommonTable = new LootTable()
	.add('Goblin paint cannon', 1, 2)
	.add('Green banner', 1, 2)
	.add('Spinning plate', [1, 20])
	.add('Brown toy horsey')
	.add('White toy horsey')
	.add('Black toy horsey')
	.add('Grey toy horsey')

	// Boxing Gloves - they have the same names so need to use IDs.
	.add(11_705)
	.add(11_706)

	.add(UncommonTable);

const DailyTable = new LootTable()
	.every('Coins', [100_000, 1_000_000])

	.add('Coins', [100_000, 500_000])
	.add(UncommonTable)
	.add(CommonTable, 1, 2)
	.add(MysteryBoxes, 1, 2);

export default function dailyRoll(qty = 1, correct = false) {
	const loot = new Bank();
	loot.add(DailyTable.roll(qty));
	// Correct trivia gives 2x extra daily roll
	if (correct) loot.add(CommonTable.roll(qty)).add(DailyTable.roll(2));
	return loot;
}
