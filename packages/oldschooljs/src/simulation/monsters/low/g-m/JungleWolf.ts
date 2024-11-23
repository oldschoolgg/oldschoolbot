import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const JungleWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 232,
	name: 'Jungle Wolf',
	table: JungleWolfTable,
	aliases: ['jungle wolf']
});
