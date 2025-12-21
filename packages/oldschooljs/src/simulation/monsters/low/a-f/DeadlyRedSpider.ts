import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const DeadlyRedSpiderTable = new LootTable({ limit: 128 }).add('Clue scroll (beginner)');

export const DeadlyRedSpider: SimpleMonster = new SimpleMonster({
	id: 3021,
	name: 'Deadly red spider',
	table: DeadlyRedSpiderTable,
	aliases: ['deadly red spider']
});
