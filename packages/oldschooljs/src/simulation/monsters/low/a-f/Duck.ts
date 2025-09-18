import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const DuckTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1838,
	name: 'Duck',
	table: DuckTable,
	aliases: ['duck']
});
