import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ShadeTable = new LootTable({ limit: 4 }).add('Shade robe top', 1, 1).add('Shade robe', 1, 1);

export default new SimpleMonster({
	id: 5633,
	name: 'Shade',
	table: ShadeTable,
	aliases: ['shade']
});
