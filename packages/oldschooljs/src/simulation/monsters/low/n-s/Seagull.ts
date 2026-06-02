import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const SeagullTable: LootTable = new LootTable().every('Bones');

export const Seagull: SimpleMonster = new SimpleMonster({
	id: 1338,
	name: 'Seagull',
	table: SeagullTable,
	aliases: ['seagull']
});
