import { GemTable, LootTable, RareTable, TreeHerbSeedTable, WyvernHerbTable } from 'oldschooljs';

const petTrollTable = new LootTable().add('Ori', 1, 1).add('Abyssal head', 1, 9);

const clueTable = new LootTable()
	.add('Clue scroll (master)', 1, 1)
	.add('Clue scroll (elite)', [1, 2], 2)
	.add('Clue scroll (elite)', 1, 2)
	.add('Clue scroll (hard)', [1, 2], 4)
	.add('Clue scroll (hard)', 1, 2);

const VisageTable = new LootTable()
	.add('Draconic visage', 1, 3)
	.add('Skeletal visage', 1, 2)
	.add('Wyvern visage', 1, 1);

const regularTable = new LootTable()
	/* Armour and weaponry */
	.add('Dragon longsword', 1, 3)
	.add('Dragon battleaxe', 1, 3)
	.add('Dragon dagger', 1, 3)
	.add('Dragon dagger (p++)', 1, 3)
	.add('Dragon halberd', 1, 3)
	.add('Dragon mace', 1, 3)
	.add('Dragon platelegs', 1, 2)
	.add('Dragon plateskirt', 1, 2)
	.add('Dragon med helm', 1, 2)
	.oneIn(60_000, 'Dragon med helm', 73)
	.oneIn(5_000_000, 'Dragon platebody')

	/* Supplies */
	.add('Black dragonhide', [2, 200])
	.add('Red dragonhide', [2, 200])
	.add('Blue dragonhide', [2, 200])
	.add('Green dragonhide', [2, 200])
	.add('Abyssal dragon bones', 10, 1)
	.add('Dragon bones', [5, 10])
	.add('Snapdragon seed', [1, 3])
	.add('Ranarr seed', [1, 3])
	.add('Dragonstone bolt tips', [10, 50])
	.add('Onyx bolt tips', [1, 10])
	.add('Coal', [12, 840])
	.add('Runite ore', 5)
	.add('Gold ore', [6, 600])
	.add('Yew logs', [5, 500])
	.add('Magic logs', [2, 250])
	.add('Soul rune', [100, 200])
	.add('Blood rune', [100, 200])
	.add('Death rune', [100, 200])
	.add('Uncut dragonstone', [1, 10])

	/* Food */
	.add('Grapes', 10, 3)
	.add('Shark', [1, 50], 3)
	.add('Raw shark', [1, 50], 3)
	.add('Manta ray', [1, 50], 2)
	.add('Raw manta ray', [1, 50], 2)
	.add('Grapes', [2, 50])

	/* Other */
	.add('Coins', [25_000, 500_000])
	.add('Anti-dragon shield')
	.add('Elemental shield')
	.add('Skull')
	.add('Bones')
	.add('Bone shard')
	.oneIn(1000, VisageTable)

	/* Sub Tables */
	.add(WyvernHerbTable, 3)
	.add(TreeHerbSeedTable, 3)
	.add(GemTable, 2)
	.add(RareTable, 2);

export const AbyssalDragonLootTable = new LootTable()
	.every('Abyssal dragon bones', 2)
	.every(regularTable, 4)

	/* Tertiary */
	.tertiary(8, clueTable)
	.tertiary(300, petTrollTable)
	.tertiary(2600, 'Abyssal cape')
	.tertiary(1024, 'Abyssal thread')
	.tertiary(1024, 'Dragon hunter lance')
	.tertiary(100, 'Lump of crystal')
	.tertiary(140, 'Clue scroll (grandmaster)');
