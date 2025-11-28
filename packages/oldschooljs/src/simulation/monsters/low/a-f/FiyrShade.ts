import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const FiyrShadeTable: LootTable = new LootTable().every('Fiyr remains');

export const FiyrShade: SimpleMonster = new SimpleMonster({
	id: 1286,
	name: 'Fiyr Shade',
	table: FiyrShadeTable,
	aliases: ['fiyr shade']
});
