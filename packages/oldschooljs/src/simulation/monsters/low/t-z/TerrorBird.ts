import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const TerrorBirdTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2064,
	name: 'Terrorbird',
	table: TerrorBirdTable,
	aliases: ['terrorbird']
});
