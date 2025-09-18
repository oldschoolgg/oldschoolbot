import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const ShadeTable = new LootTable({ limit: 4 }).add('Shade robe top', 1, 1).add('Shade robe', 1, 1);

export default new SimpleMonster({
	id: 5633,
	name: 'Shade',
	table: ShadeTable,
	aliases: ['shade']
});
