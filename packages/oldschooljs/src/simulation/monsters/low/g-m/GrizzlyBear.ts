import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GrizzlyBearTable: LootTable = new LootTable()
	.every('Bones')
	.every('Bear fur')
	.every('Raw bear meat')

	/* Tertiary */
	.tertiary(25, 'Ensouled bear head', 1)
	.tertiary(90, 'Clue scroll (beginner)', 1);

export const GrizzlyBear: SimpleMonster = new SimpleMonster({
	id: 3423,
	name: 'Grizzly bear',
	table: GrizzlyBearTable,
	aliases: ['grizzly', 'grizzly bear']
});
