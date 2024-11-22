import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const BirdTable = new LootTable();

export default new SimpleMonster({
	id: 5240,
	name: 'Bird',
	table: BirdTable,
	aliases: ['bird']
});
