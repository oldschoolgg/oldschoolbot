import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const CowTable = new LootTable()
	.every('Bones')
	.every('Cowhide')
	.every('Raw beef')
	.tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 2790,
	name: 'Cow',
	table: CowTable,
	aliases: ['cow']
});
