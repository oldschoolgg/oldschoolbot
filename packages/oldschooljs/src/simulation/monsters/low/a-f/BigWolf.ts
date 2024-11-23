import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const BigWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 115,
	name: 'Big Wolf',
	table: BigWolfTable,
	aliases: ['big wolf']
});
