import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const AsynShadeTable: LootTable = new LootTable().every('Asyn remains');

export const AsynShade: SimpleMonster = new SimpleMonster({
	id: 1284,
	name: 'Asyn Shade',
	table: AsynShadeTable,
	aliases: ['asyn shade']
});
