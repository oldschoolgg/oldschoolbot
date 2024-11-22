import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const UnicornTable = new LootTable().every('Bones').every('Unicorn horn').tertiary(35, 'Ensouled unicorn head');

export default new SimpleMonster({
	id: 2837,
	name: 'Unicorn',
	table: UnicornTable,
	aliases: ['unicorn']
});
