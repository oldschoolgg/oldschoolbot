import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GhostTable: LootTable = new LootTable().tertiary(90, 'Clue scroll (beginner)', 1);

export const Ghost: SimpleMonster = new SimpleMonster({
	id: 85,
	name: 'Ghost',
	table: GhostTable,
	aliases: ['ghost']
});
