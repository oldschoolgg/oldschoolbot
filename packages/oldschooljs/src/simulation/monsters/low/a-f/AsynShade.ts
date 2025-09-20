import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const AsynShadeTable = new LootTable().every('Asyn remains');

export default new SimpleMonster({
	id: 1284,
	name: 'Asyn Shade',
	table: AsynShadeTable,
	aliases: ['asyn shade']
});
