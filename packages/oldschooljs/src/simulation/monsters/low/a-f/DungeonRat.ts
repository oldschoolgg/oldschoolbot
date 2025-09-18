import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DungeonRatTable = new LootTable()
	.every('Bones')
	.every('Raw rat meat')
	.tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 2865,
	name: 'Dungeon rat',
	table: DungeonRatTable,
	aliases: ['dungeon rat']
});
