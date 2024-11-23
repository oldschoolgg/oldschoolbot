import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const FiyrShadeTable = new LootTable().every('Fiyr remains');

export default new SimpleMonster({
	id: 1286,
	name: 'Fiyr Shade',
	table: FiyrShadeTable,
	aliases: ['fiyr shade']
});
