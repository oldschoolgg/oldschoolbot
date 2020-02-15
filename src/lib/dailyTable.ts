import LootTable from 'oldschooljs/dist/structures/LootTable';
import Loot from 'oldschooljs/dist/structures/Loot';

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
	.add('Event rpg', 1, 2)
	.add('Green banner', 1, 2)
	.add('Spinning plate', [1, 20])
	.add('Brown toy horsey')
	.add('White toy horsey')
	.add('Black toy horsey')
	.add('Grey toy horsey')

	// Boxing Gloves - they have the same names so need to use IDs.
	.add(11705)
	.add(11706)

	.add(UncommonTable);

const CasketTable = new LootTable()
	.add('Reward casket (beginner)', 1, 4)
	.add('Reward casket (easy)', 1, 3)
	.add('Reward casket (medium)', 1, 2)
	.add('Reward casket (hard)', 1, 1);

const DailyTable = new LootTable()
	.every('Coins', [1_000_000, 3_000_000])

	.add('Coins', [100_000, 10_000_000])
	.add(CasketTable)
	.add(UncommonTable)
	.add(CommonTable, 1, 2)
	.add('Mystery box', 1, 2);

export default function dailyRoll(qty = 1) {
	const loot = new Loot();

	for (let i = 0; i < qty; i++) {
		loot.add(DailyTable.roll());
		loot.add(CommonTable.roll());
	}

	return loot.values();
}
