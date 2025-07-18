import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 3937,
	name: 'Fremennik citizen',
	pickpocketTable: new LootTable().add('Coins', 40),
	aliases: ['fremennik citizen']
});
