import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PhrinShadeTable: LootTable = new LootTable().every('Phrin remains');

export const PhrinShade: SimpleMonster = new SimpleMonster({
	id: 1280,
	name: 'Phrin Shade',
	table: PhrinShadeTable,
	aliases: ['phrin shade']
});
