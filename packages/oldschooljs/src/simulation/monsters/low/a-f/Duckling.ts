import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const DucklingTable = new LootTable();

export default new SimpleMonster({
	id: 2001,
	name: 'Duckling',
	table: DucklingTable,
	aliases: ['duckling']
});
