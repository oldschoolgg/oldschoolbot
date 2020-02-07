import LootTable from 'oldschooljs/dist/structures/LootTable';
import Loot from 'oldschooljs/dist/structures/Loot';

const RareTable = new LootTable()
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

const CasketTable = new LootTable()
	.add('Reward casket (beginner)', 1, 6)
	.add('Reward casket (easy)', 1, 5)
	.add('Reward casket (medium)', 1, 4)
	.add('Reward casket (hard)', 1, 3)
	.add('Reward casket (elite)', 1, 2)
	.add('Reward casket (master)', 1, 1);

const DailyTable = new LootTable()
	.every('Coins', [1_000_000, 4_000_000])
	.oneIn(2000, 'Hornwood helm')
	.add(UncommonTable)
	.add('Spinning plate', [1, 20])
	.add('Brown toy horsey')
	.add('White toy horsey')
	.add('Black toy horsey')
	.add('Grey toy horsey')

	// Boxing Gloves - they have the same names so need to use IDs.
	.add(11705)
	.add(11706)

	.add('Coins', [500_000, 15_000_000])
	.add(CasketTable)

	.add('Event rpg', 1, 2)
	.add('Green banner', 1, 2);

export default function dailyRoll(qty: number = 1) {
	const loot = new Loot();

	for (let i = 0; i < qty; i++) {
		loot.add(DailyTable.roll());
	}

	return loot.values();
}
