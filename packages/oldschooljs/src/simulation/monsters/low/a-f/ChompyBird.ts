import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ChompyBirdTable = new LootTable().every('Bones').every('Raw chompy').oneIn(500, 'Chompy chick');

export default new SimpleMonster({
	id: 1475,
	name: 'Chompy bird',
	table: ChompyBirdTable,
	aliases: ['chompy', 'chompy bird']
});
