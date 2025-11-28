import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const LoarShadeTable: LootTable = new LootTable().every('Loar remains');

export const LoarShade: SimpleMonster = new SimpleMonster({
	id: 1277,
	name: 'Loar Shade',
	table: LoarShadeTable,
	aliases: ['loar shade']
});
