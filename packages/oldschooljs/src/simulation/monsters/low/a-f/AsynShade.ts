import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const AsynShadeTable = new LootTable().every('Asyn remains');

export default new SimpleMonster({
	id: 1284,
	name: 'Asyn Shade',
	table: AsynShadeTable,
	aliases: ['asyn shade']
});
