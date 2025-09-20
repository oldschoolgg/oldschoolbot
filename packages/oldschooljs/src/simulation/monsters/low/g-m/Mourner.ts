import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const MournerTable = new LootTable()
	.every('Bones')
	.every('Mourner cloak')
	.every('Mourner boots')
	.every('Mourner gloves')
	.every('Gas mask')
	.every('Mourner trousers');

export default new SimpleMonster({
	id: 8844,
	name: 'Mourner',
	table: MournerTable,
	aliases: ['mourner']
});
