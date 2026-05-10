import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PitScorpionTable: LootTable = new LootTable()
	.tertiary(25, 'Ensouled scorpion head')
	.tertiary(100, 'Clue scroll (beginner)');

export const PitScorpion: SimpleMonster = new SimpleMonster({
	id: 3026,
	name: 'Pit Scorpion',
	table: PitScorpionTable,
	aliases: ['pit scorpion']
});
