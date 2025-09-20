import ManWomanTable from '@/simulation/subtables/ManWomanTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export default new SimpleMonster({
	id: 1118,
	name: 'Man',
	table: ManWomanTable,
	pickpocketTable: new LootTable().add('Coins', 3).tertiary(257_211, 'Rocky'),
	aliases: ['man', 'men']
});
