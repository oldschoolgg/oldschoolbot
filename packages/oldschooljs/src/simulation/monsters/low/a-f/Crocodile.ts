import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const CrocodileTable: LootTable = new LootTable()
	.every('Babydragon bones')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export const Crocodile: SimpleMonster = new SimpleMonster({
	id: 4184,
	name: 'Crocodile',
	table: CrocodileTable,
	aliases: ['crocodile']
});
