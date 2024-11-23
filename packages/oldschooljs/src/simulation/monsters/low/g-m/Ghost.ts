import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GhostTable = new LootTable().tertiary(90, 'Clue scroll (beginner)', 1);

export default new SimpleMonster({
	id: 85,
	name: 'Ghost',
	table: GhostTable,
	aliases: ['ghost']
});
