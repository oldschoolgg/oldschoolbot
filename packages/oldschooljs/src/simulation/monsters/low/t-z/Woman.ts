import { ManWomanTable } from '@/simulation/subtables/ManWomanTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const Woman: SimpleMonster = new SimpleMonster({
	id: 1119,
	name: 'Woman',
	table: ManWomanTable,
	pickpocketTable: new LootTable().add('Coins', 3),
	aliases: ['women', 'woman']
});
