import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GiantSpiderTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 2477,
	name: 'Giant spider',
	table: GiantSpiderTable,
	aliases: ['giant spider']
});
