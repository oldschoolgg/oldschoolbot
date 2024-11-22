import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const DwarfGangMemberTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1354,
	name: 'Dwarf gang member',
	table: DwarfGangMemberTable,
	aliases: ['dwarf gang member']
});
