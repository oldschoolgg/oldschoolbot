import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

const freshCrabTable = new LootTable().add('Fresh crab claw').add('Fresh crab shell');

export const CrabTable = new LootTable()
	.every('Crab meat')
	.tertiary(4, freshCrabTable)

	.add(new LootTable(), 1, 9) // Nothing drop
	.add('Oyster', 1, 1);

export default new SimpleMonster({
	id: 4819,
	name: 'Crab',
	table: CrabTable,
	aliases: ['crab']
});
