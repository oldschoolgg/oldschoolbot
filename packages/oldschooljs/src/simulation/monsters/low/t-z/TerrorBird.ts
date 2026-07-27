import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const TerrorBirdTable: LootTable = new LootTable().every('Bones');

export const TerrorBird: SimpleMonster = new SimpleMonster({
	id: 2064,
	name: 'Terrorbird',
	table: TerrorBirdTable,
	aliases: ['terrorbird']
});
