import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const TerrorBirdTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2064,
	name: 'Terrorbird',
	table: TerrorBirdTable,
	aliases: ['terrorbird']
});
