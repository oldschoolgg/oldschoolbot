import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GhostTable = new LootTable().tertiary(90, 'Clue scroll (beginner)', 1);

export default new SimpleMonster({
	id: 85,
	name: 'Ghost',
	table: GhostTable,
	aliases: ['ghost']
});
