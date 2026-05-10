import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DesertWolfTable: LootTable = new LootTable().every('Wolf bones');

export const DesertWolf: SimpleMonster = new SimpleMonster({
	id: 4649,
	name: 'Desert Wolf',
	table: DesertWolfTable,
	aliases: ['desert wolf']
});
