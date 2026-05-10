import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const CowTable: LootTable = new LootTable()
	.every('Bones')
	.every('Cowhide')
	.every('Raw beef')
	.tertiary(128, 'Clue scroll (beginner)');

export const Cow: SimpleMonster = new SimpleMonster({
	id: 2790,
	name: 'Cow',
	table: CowTable,
	aliases: ['cow']
});
