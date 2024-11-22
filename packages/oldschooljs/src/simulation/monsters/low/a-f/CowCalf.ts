import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const CowCalfTable = new LootTable()
	.every('Bones')
	.every('Cowhide')
	.every('Raw beef')
	.tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 2792,
	name: 'Cow calf',
	table: CowCalfTable,
	aliases: ['cow calf']
});
