import { Monsters } from 'oldschooljs';
import { RareTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import { GemTable } from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import TreeHerbSeedTable from 'oldschooljs/dist/simulation/subtables/TreeHerbSeedTable';
import WyvernHerbTable from 'oldschooljs/dist/simulation/subtables/WyvernHerbTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import setCustomMonster from '../../../../util/setCustomMonster';

export const AbyssalDragonLootTable = new LootTable()
	.every('Abyssal dragon bones', 2)

	// Uniques
	.tertiary(5120, 'Abyssal cape')
	.tertiary(3076, 'Ori')
	.tertiary(1024, 'Abyssal thread')

	// Uniques
	.tertiary(
		2,
		new LootTable()
			.add('Clue scroll (master)', [1, 2], 1)
			.add('Clue scroll (master)', 1, 2)

			.add('Clue scroll (elite)', [1, 3], 2)
			.add('Clue scroll (elite)', 1, 4)

			.add('Clue scroll (hard)', [1, 4], 4)
			.add('Clue scroll (hard)', 1, 8)
	)

	.oneIn(
		30,
		new LootTable()
			.add('Black dragonhide', [100, 200])
			.add('Red dragonhide', [100, 200])
			.add('Blue dragonhide', [100, 200])
			.add('Green dragonhide', [100, 200])
			.add('Coal', [20, 140])
			.add('Yew logs', 500)
			.add('Magic logs', 250)
			.oneIn(2, 'Gold ore', 600)
			.oneIn(10, 'Raw shark', 200)
			.oneIn(15, 'Raw manta ray', 200)
			.oneIn(512, 'Dragon med helm', 73)
	)

	.oneIn(
		1000,
		new LootTable()
			.add('Draconic visage', 1, 3)
			.add('Skeletal visage', 1, 2)
			.add('Wyvern visage', 1, 1)
	)

	.oneIn(
		2,
		new LootTable()
			.add('Dragon platelegs')
			.add('Dragon plateskirt')
			.add('Dragon longsword')
			.add('Dragon battleaxe')
			.add('Dragon dagger')
			.add('Dragon halberd')
	)

	.oneIn(100, 'Abyssal dragon bones', 10)
	.oneIn(10, 'Grapes', [20, 50])

	.add('Dragon bones', [5, 10])
	.add('Runite ore', 5)
	.add('Grapes', 10)
	.add('Snapdragon seed', [1, 3])
	.add('Ranarr seed', [1, 3])
	.add('Dragonstone bolt tips', [10, 50])
	.add('Onyx bolt tips', [1, 10])
	.add('Coins', [50_000, 1_000_000])
	.add('Anti-dragon shield')
	.add('Elemental shield')

	.add(WyvernHerbTable, 3)
	.add(TreeHerbSeedTable, 3)
	.add(GemTable, 2)
	.add(RareTable, 2);

setCustomMonster(707070, 'Malygos', AbyssalDragonLootTable, Monsters.Vorkath, {
	id: 696969,
	name: 'Malygos',
	aliases: ['abyssal dragon', 'abyss drag']
});

const AbyssalDragon = Monsters.find(mon => mon.name === 'Malygos')!;

export default AbyssalDragon;
