import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const GoatTable: LootTable = new LootTable().every('Bones').every('Desert goat horn');

export const Goat: SimpleMonster = new SimpleMonster({
	id: 1792,
	name: 'Goat',
	table: GoatTable,
	aliases: ['goat']
});
