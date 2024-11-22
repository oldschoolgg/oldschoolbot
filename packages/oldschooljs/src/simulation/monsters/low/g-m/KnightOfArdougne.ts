import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 3297,
	name: 'Knight of Ardougne',
	pickpocketTable: new LootTable().add('Coins', 50).tertiary(257_211, 'Rocky'),
	aliases: ['ardy knight', 'ardougne knight', 'knight of ardougne']
});
