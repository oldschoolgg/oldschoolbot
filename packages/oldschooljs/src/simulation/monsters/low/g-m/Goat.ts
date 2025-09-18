import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const GoatTable = new LootTable().every('Bones').every('Desert goat horn');

export default new SimpleMonster({
	id: 1792,
	name: 'Goat',
	table: GoatTable,
	aliases: ['goat']
});
