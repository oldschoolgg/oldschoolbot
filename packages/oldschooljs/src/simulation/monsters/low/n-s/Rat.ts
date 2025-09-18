import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const RatTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2854,
	name: 'Rat',
	table: RatTable,
	aliases: ['rat']
});
