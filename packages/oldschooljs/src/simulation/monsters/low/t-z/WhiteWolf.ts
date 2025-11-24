import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const WhiteWolfTable: LootTable = new LootTable().every('Wolf bones');

export const WhiteWolf: SimpleMonster = new SimpleMonster({
	id: 108,
	name: 'White Wolf',
	table: WhiteWolfTable,
	aliases: ['white wolf']
});
