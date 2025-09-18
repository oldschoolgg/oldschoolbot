import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const LoarShadeTable = new LootTable().every('Loar remains');

export default new SimpleMonster({
	id: 1277,
	name: 'Loar Shade',
	table: LoarShadeTable,
	aliases: ['loar shade']
});
