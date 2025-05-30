import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const FarmerTable = new LootTable().add('Coins', 9, 98).add('Potato seed', 1, 2);

export default new SimpleMonster({
	id: 3114,
	name: 'Farmer',
	pickpocketTable: FarmerTable,
	aliases: ['farmer']
});
