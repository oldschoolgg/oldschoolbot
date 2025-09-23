import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const IceWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 645,
	name: 'Ice wolf',
	table: IceWolfTable,
	aliases: ['ice wolf']
});
