import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const UndeadChickenTable = new LootTable({ limit: 4 })
	.every('Bones')
	.every('Raw chicken')
	.add('Feather', 5, 2)
	.add('Feather', 15, 1);

export default new SimpleMonster({
	id: 2993,
	name: 'Undead chicken',
	table: UndeadChickenTable,
	aliases: ['undead chicken']
});
