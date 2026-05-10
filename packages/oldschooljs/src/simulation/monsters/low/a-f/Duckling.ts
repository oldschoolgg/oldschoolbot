import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DucklingTable: LootTable = new LootTable();

export const Duckling: SimpleMonster = new SimpleMonster({
	id: 2001,
	name: 'Duckling',
	table: DucklingTable,
	aliases: ['duckling']
});
