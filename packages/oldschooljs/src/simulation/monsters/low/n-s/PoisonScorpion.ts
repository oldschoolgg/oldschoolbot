import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PoisonScorpionTable: LootTable = new LootTable()
	.tertiary(25, 'Ensouled scorpion head')
	.tertiary(100, 'Clue scroll (beginner)');

export const PoisonScorpion: SimpleMonster = new SimpleMonster({
	id: 3025,
	name: 'Poison Scorpion',
	table: PoisonScorpionTable,
	aliases: ['poison scorpion']
});
