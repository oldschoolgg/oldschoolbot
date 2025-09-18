import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const DagannothFledgeling = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2264,
	name: 'Dagannoth fledgeling',
	table: DagannothFledgeling,
	aliases: ['dagannoth fledgeling']
});
