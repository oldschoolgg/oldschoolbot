import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const WhiteWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 108,
	name: 'White Wolf',
	table: WhiteWolfTable,
	aliases: ['white wolf']
});
