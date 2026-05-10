import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const SpiderTable: LootTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export const Spider: SimpleMonster = new SimpleMonster({
	id: 3019,
	name: 'Spider',
	table: SpiderTable,
	aliases: ['spider']
});
