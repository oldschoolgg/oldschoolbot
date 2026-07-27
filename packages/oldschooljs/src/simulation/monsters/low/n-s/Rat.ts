import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const RatTable: LootTable = new LootTable().every('Bones');

export const Rat: SimpleMonster = new SimpleMonster({
	id: 2854,
	name: 'Rat',
	table: RatTable,
	aliases: ['rat']
});
