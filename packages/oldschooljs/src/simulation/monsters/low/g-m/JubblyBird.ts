import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export default new SimpleMonster({
	id: 4863,
	name: 'Jubbly bird',
	table: new LootTable().every('Big bones').every('Raw jubbly').add('Feather', [25, 32]),
	aliases: ['jubbly bird', 'jubbly']
});
