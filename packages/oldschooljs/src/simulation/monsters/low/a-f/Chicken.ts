import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ChickenTable = new LootTable({ limit: 4 })
	.every('Bones')
	.every('Raw chicken')
	.add('Feather', 5, 2)
	.add('Feather', 15, 1)
	.tertiary(300, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 3316,
	name: 'Chicken',
	table: ChickenTable,
	aliases: ['chicken']
});
