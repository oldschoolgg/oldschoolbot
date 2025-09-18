import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const GrizzlyBearCubTable = new LootTable()
	.every('Bones')
	.every('Bear fur')
	.every('Raw bear meat')

	/* Tertiary */
	.tertiary(25, 'Ensouled bear head', 1)
	.tertiary(90, 'Clue scroll (beginner)', 1);

export default new SimpleMonster({
	id: 3425,
	name: 'Grizzly bear cub',
	table: GrizzlyBearCubTable,
	aliases: ['grizzly cub', 'grizzly bear cub']
});
