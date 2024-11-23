import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ShadowSpiderTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 3016,
	name: 'Shadow spider',
	table: ShadowSpiderTable,
	aliases: ['shadow spider']
});
