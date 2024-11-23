import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 4863,
	name: 'Jubbly bird',
	table: new LootTable().every('Big bones').every('Raw jubbly').add('Feather', [25, 32]),
	aliases: ['jubbly bird', 'jubbly']
});
