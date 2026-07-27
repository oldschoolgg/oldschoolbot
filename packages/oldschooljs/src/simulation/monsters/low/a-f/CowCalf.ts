import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const CowCalfTable: LootTable = new LootTable()
	.every('Bones')
	.every('Cowhide')
	.every('Raw beef')
	.tertiary(128, 'Clue scroll (beginner)');

export const CowCalf: SimpleMonster = new SimpleMonster({
	id: 2792,
	name: 'Cow calf',
	table: CowCalfTable,
	aliases: ['cow calf']
});
