import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const BirdTable = new LootTable();

export default new SimpleMonster({
	id: 5240,
	name: 'Bird',
	table: BirdTable,
	aliases: ['bird']
});
