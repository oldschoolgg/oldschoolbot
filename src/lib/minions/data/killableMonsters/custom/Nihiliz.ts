import RareDropTable, { GemTable } from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import TreeHerbSeedTable from 'oldschooljs/dist/simulation/subtables/TreeHerbSeedTable';
import WyvernHerbTable from 'oldschooljs/dist/simulation/subtables/WyvernHerbTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { StaffOrbTable } from '../../../../simulation/sharedTables';

const stoneSpiritTable = new LootTable()
	.add('Copper stone spirit', [1, 4], 3)
	.add('Tin stone spirit', [1, 4], 3)
	.add('Coal stone spirit', [2, 5], 4)
	.add('Silver stone spirit', [1, 4], 3)
	.add('Mithril stone spirit', [1, 3], 2)
	.add('Runite stone spirit', 5, 1);

const clueTable = new LootTable()
	.add('Clue scroll (master)', [1, 3], 1)
	.add('Clue scroll (master)', 1, 2)
	.add('Clue scroll (elite)', [1, 4], 2)
	.add('Clue scroll (elite)', 1, 4)
	.add('Clue scroll (medium)', [1, 5], 4)
	.add('Clue scroll (medium)', 1, 8);

const foodTable = new LootTable()
	.add('Shark', [1, 50], 3)
	.add('Manta ray', [1, 50], 2)
	.add('Raw tuna', [50, 150], 3)
	.add('Raw swordfish', [40, 120], 2)
	.add('Raw anglerfish', [5, 10], 2)
	.add('Raw rocktail', [2, 5], 2);

const regularTable = new LootTable()
	/* Armour and weaponry */
	.add('Battlestaff', 5, 2)
	.add('Air battlestaff', 3, 2)
	.add('Fire battlestaff', 3, 2)

	.oneIn(1000, 'Ancient staff')
	.oneIn(1000, 'Smoke battlestaff')

	/* Supplies */
	.add('Dragon bolts (unf)', [20, 30], 2)
	.add('Cadantine seed', [1, 3], 2)
	.add('Toadflax seed', [1, 3], 2)
	.add('Bow string', [100, 400], 2)
	.add('Ruby bolt tips', [15, 75])
	.add('Dragonstone bolt tips', [10, 50])
	.add('Onyx bolt tips', [2, 10])
	.add('Soul rune', [200, 400])
	.add('Blood rune', [200, 400])
	.add('Death rune', [200, 500])
	.add('Amethyst', [10, 25])
	.add('Uncut dragonstone', [10, 20])

	/* Food */
	.add(foodTable, 1, 14)

	/* Other */
	.add('Coins', [50_000, 200_000])
	.add('Pure essence', [2000, 3000])
	.tertiary(500, 'Uncut zenyte', [1, 3])

	/* Troll drops */
	.oneIn(73_000, StaffOrbTable, 1000, { multiply: true })

	/* Sub Tables */
	.add(StaffOrbTable, [15, 25], 6, { multiply: true })
	.add(WyvernHerbTable, 3, 2)
	.add(TreeHerbSeedTable, 3)
	.add(GemTable, 2, 3)
	.add(new LootTable().add(RareDropTable, 2, 1, { multiply: true }), 2)
	.add(stoneSpiritTable, 3);

export const NihilizLootTable = new LootTable()
	.every(regularTable, 3)

	/* Tertiary */
	.tertiary(4, foodTable)
	.tertiary(8, clueTable)
	.tertiary(10, 'Nihil shard', [5, 20])
	.tertiary(1200, 'Nihil horn')
	.tertiary(900, 'Zaryte vambraces')
	.tertiary(100, 'Clue scroll (grandmaster)')
	.tertiary(5000, 'Nexling');
