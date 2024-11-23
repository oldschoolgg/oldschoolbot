import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const UriumShadeTable = new LootTable().every('Urium remains');

export default new SimpleMonster({
	id: 10_589,
	name: 'Urium Shade',
	table: UriumShadeTable,
	aliases: ['urium shade', 'urium']
});
