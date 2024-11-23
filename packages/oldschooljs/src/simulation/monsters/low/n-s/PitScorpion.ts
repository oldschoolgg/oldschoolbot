import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const PitScorpionTable = new LootTable()
	.tertiary(25, 'Ensouled scorpion head')
	.tertiary(100, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 3026,
	name: 'Pit Scorpion',
	table: PitScorpionTable,
	aliases: ['pit scorpion']
});
