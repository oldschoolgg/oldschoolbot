import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const BatTable = new LootTable().every('Bat bones');
export default new SimpleMonster({
	id: 2827,
	name: 'Bat',
	table: BatTable,
	aliases: ['bat']
});
