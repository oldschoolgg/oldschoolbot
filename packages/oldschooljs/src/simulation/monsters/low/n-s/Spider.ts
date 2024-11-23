import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const SpiderTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 3019,
	name: 'Spider',
	table: SpiderTable,
	aliases: ['spider']
});
