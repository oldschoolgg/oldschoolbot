import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 3260,
	name: 'Warrior woman',
	pickpocketTable: new LootTable().add('Coins', 18).tertiary(257_211, 'Rocky'),
	aliases: ['warrior woman']
});
