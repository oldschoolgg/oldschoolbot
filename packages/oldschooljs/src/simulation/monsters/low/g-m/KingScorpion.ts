import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const KingScorpionTable = new LootTable()
	.tertiary(25, 'Ensouled scorpion head')
	.tertiary(100, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 3027,
	name: 'King Scorpion',
	table: KingScorpionTable,
	aliases: ['king scorpion']
});
