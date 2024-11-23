import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const IceWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 645,
	name: 'Ice wolf',
	table: IceWolfTable,
	aliases: ['ice wolf']
});
