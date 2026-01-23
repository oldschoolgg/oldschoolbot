import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const RiylShadeTable: LootTable = new LootTable().every('Riyl remains');

export const RiylShade: SimpleMonster = new SimpleMonster({
	id: 1282,
	name: 'Riyl Shade',
	table: RiylShadeTable,
	aliases: ['riyl shade']
});
