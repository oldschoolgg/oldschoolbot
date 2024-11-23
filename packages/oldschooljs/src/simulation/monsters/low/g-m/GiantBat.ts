import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const GiantBatTable = new LootTable().every('Bat bones');

export default new SimpleMonster({
	id: 2834,
	name: 'Giant Bat',
	table: GiantBatTable,
	aliases: ['giant bat']
});
