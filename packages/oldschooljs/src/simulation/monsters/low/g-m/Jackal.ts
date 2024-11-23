import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const JackalTable = new LootTable().every('Bones');
export default new SimpleMonster({
	id: 4185,
	name: 'Jackal',
	table: JackalTable,
	aliases: ['jackal']
});
