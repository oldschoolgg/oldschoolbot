import { ManWomanTable } from '@/simulation/subtables/ManWomanTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const Man: SimpleMonster = new SimpleMonster({
	id: 1118,
	name: 'Man',
	table: ManWomanTable,
	pickpocketTable: new LootTable().add('Coins', 3),
	aliases: ['man', 'men']
});
