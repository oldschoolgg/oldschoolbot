import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const DuckTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1838,
	name: 'Duck',
	table: DuckTable,
	aliases: ['duck']
});
