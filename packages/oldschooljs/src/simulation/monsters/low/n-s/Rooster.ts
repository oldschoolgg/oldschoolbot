import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const RoosterTable = new LootTable({ limit: 4 })
	.every('Bones')
	.every('Raw chicken')
	.add('Feather', 5, 2)
	.add('Feather', 15, 1);

export default new SimpleMonster({
	id: 3663,
	name: 'Rooster',
	table: RoosterTable,
	aliases: ['rooster']
});
