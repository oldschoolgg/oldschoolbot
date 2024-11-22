import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GiantRatTable = new LootTable()
	.every('Bones')
	.every('Raw rat meat')
	.tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 2510,
	name: 'Giant rat',
	table: GiantRatTable,
	aliases: ['giant rat']
});
