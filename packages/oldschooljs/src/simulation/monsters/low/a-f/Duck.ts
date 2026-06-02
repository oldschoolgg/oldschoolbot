import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DuckTable: LootTable = new LootTable().every('Bones');

export const Duck: SimpleMonster = new SimpleMonster({
	id: 1838,
	name: 'Duck',
	table: DuckTable,
	aliases: ['duck']
});
