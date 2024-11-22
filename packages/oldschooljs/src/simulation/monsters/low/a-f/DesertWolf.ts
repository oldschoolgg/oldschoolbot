import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const DesertWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 4649,
	name: 'Desert Wolf',
	table: DesertWolfTable,
	aliases: ['desert wolf']
});
