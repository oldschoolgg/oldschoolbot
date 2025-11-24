import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const UriumShadeTable: LootTable = new LootTable().every('Urium remains');

export const UriumShade: SimpleMonster = new SimpleMonster({
	id: 10_589,
	name: 'Urium Shade',
	table: UriumShadeTable,
	aliases: ['urium shade', 'urium']
});
