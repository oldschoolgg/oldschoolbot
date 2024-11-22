import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const RiylShadeTable = new LootTable().every('Riyl remains');

export default new SimpleMonster({
	id: 1282,
	name: 'Riyl Shade',
	table: RiylShadeTable,
	aliases: ['riyl shade']
});
