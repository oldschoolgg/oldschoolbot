import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const SeagullTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1338,
	name: 'Seagull',
	table: SeagullTable,
	aliases: ['seagull']
});
