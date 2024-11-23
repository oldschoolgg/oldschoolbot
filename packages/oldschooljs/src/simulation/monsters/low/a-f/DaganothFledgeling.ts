import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const DagannothFledgeling = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2264,
	name: 'Dagannoth fledgeling',
	table: DagannothFledgeling,
	aliases: ['dagannoth fledgeling']
});
