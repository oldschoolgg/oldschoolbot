import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import ManWomanTable from '../../../subtables/ManWomanTable';

export default new SimpleMonster({
	id: 1118,
	name: 'Man',
	table: ManWomanTable,
	pickpocketTable: new LootTable().add('Coins', 3).tertiary(257_211, 'Rocky'),
	aliases: ['man', 'men']
});
