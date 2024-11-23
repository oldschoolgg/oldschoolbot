import LootTable from '../../structures/LootTable';
import HerbDropTable from './HerbDropTable';

export default new LootTable({ limit: 128 })
	.every('Bones')

	.add('Bronze med helm', 1, 2)
	.add('Iron dagger', 1)

	.add('Bronze bolts', [2, 12], 22)
	.add('Bronze arrow', 7, 3)
	.add('Earth rune', 4, 2)
	.add('Fire rune', 6, 2)
	.add('Mind rune', 9, 2)
	.add('Chaos rune', 2, 1)

	.add(HerbDropTable, 1, 23)

	.add('Coins', 3, 38)
	.add('Coins', 5, 9)
	.add('Coins', 15, 4)
	.add('Coins', 25, 1)

	.add('Fishing bait', 1, 5)
	.add('Copper ore', 1, 2)
	.add('Earth talisman', 1, 2)
	.add('Cabbage', 1, 1)

	.tertiary(90, 'Clue scroll (beginner)', 1)
	.tertiary(128, 'Clue scroll (easy)', 1);
