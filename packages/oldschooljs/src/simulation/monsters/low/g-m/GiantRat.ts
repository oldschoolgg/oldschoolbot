import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GiantRatTable: LootTable = new LootTable()
	.every('Bones')
	.every('Raw rat meat')
	.tertiary(128, 'Clue scroll (beginner)');

export const GiantRat: SimpleMonster = new SimpleMonster({
	id: 2510,
	name: 'Giant rat',
	table: GiantRatTable,
	aliases: ['giant rat']
});
