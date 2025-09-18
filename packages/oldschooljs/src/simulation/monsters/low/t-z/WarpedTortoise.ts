import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';
import RareDropTable from '@/simulation/subtables/RareDropTable.js';

export const WarpedTortoiseTable = new LootTable()
	.tertiary(512, 'Clue scroll (hard)')
	.tertiary(320, 'Warped sceptre (uncharged)')
	.tertiary(400, 'Long bone')
	.tertiary(5012, 'Curved bone')
	.every('Bones')
	.add('Adamant axe', 1, 2)
	.add('Adamant platebody', 1, 2)
	.add('Rune pickaxe', 1, 1)
	.add('Rune kiteshield', 1, 1)
	.add('Rune warhammer', 1, 1)

	.add('Earth rune', [80, 100], 6)
	.add('Mud rune', [30, 50], 5)
	.add('Death rune', [15, 20], 3)

	.add('Coins', [600, 800], 10)
	.add('Swamp tar', [40, 60], 6)
	.add('Cabbage', [20, 40], 6)
	.add('Weapon poison', 1, 3)
	.add('Pineapple', 1, 3)
	.add("Tangled toad's legs", [2, 3], 3)
	.add('Adamantite ore', [3, 5], 2)
	.add('Tortoise shell', [1, 3], 2)
	.add('Perfect shell', [1, 3], 2)
	.add(RareDropTable, 1, 3);

export const WarpedTortoise = new SimpleMonster({
	id: 12_490,
	name: 'Warped Tortoise',
	table: WarpedTortoiseTable,
	aliases: ['warped tortoise']
});
