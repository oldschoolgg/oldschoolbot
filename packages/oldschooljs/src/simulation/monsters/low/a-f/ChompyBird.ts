import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const ChompyBirdTable: LootTable = new LootTable().every('Bones').every('Raw chompy').oneIn(500, 'Chompy chick');

export const ChompyBird: SimpleMonster = new SimpleMonster({
	id: 1475,
	name: 'Chompy bird',
	table: ChompyBirdTable,
	aliases: ['chompy', 'chompy bird']
});
