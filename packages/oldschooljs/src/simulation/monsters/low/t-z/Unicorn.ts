import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const UnicornTable = new LootTable().every('Bones').every('Unicorn horn').tertiary(35, 'Ensouled unicorn head');

export default new SimpleMonster({
	id: 2837,
	name: 'Unicorn',
	table: UnicornTable,
	aliases: ['unicorn']
});
