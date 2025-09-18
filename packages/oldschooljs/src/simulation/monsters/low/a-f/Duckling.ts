import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const DucklingTable = new LootTable();

export default new SimpleMonster({
	id: 2001,
	name: 'Duckling',
	table: DucklingTable,
	aliases: ['duckling']
});
