import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const PriffRabbit = new LootTable().every('Crystal grail');

export default new SimpleMonster({
	id: 9118,
	name: 'Rabbit',
	table: PriffRabbit,
	aliases: ['rabbit']
});
