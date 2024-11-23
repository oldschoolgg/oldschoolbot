import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const SeagullTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1338,
	name: 'Seagull',
	table: SeagullTable,
	aliases: ['seagull']
});
