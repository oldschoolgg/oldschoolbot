import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DagannothFledgeling: SimpleMonster = new SimpleMonster({
	id: 2264,
	name: 'Dagannoth fledgeling',
	table: new LootTable().every('Bones'),
	aliases: ['dagannoth fledgeling']
});
