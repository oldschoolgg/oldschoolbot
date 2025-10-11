import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const RiylShadeTable = new LootTable().every('Riyl remains');

export default new SimpleMonster({
	id: 1282,
	name: 'Riyl Shade',
	table: RiylShadeTable,
	aliases: ['riyl shade']
});
