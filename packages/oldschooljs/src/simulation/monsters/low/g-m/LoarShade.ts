import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const LoarShadeTable = new LootTable().every('Loar remains');

export default new SimpleMonster({
	id: 1277,
	name: 'Loar Shade',
	table: LoarShadeTable,
	aliases: ['loar shade']
});
