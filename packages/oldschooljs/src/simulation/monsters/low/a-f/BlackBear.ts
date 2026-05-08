import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const BlackBearTable: LootTable = new LootTable()
	.every('Bones')
	.every('Bear fur')
	.every('Raw bear meat')

	/* Tertiary */
	.tertiary(25, 'Ensouled bear head', 1)
	.tertiary(90, 'Clue scroll (beginner)', 1);

export const BlackBear: SimpleMonster = new SimpleMonster({
	id: 2839,
	name: 'Black bear',
	table: BlackBearTable,
	aliases: ['bear', 'black bear', 'bears']
});
