import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { BasiliskPreTable } from '../low/a-f/Basilisk.js';

const MonstrousBasiliskTable = new LootTable()
	.every('Bones')
	.every(BasiliskPreTable, 3)

	/* Tertiary */
	.tertiary(2000, 'Basilisk head')

	/* Superior Slayer tertiary */
	.tertiary(292, 'Mist battlestaff')
	.tertiary(292, 'Dust battlestaff')
	.tertiary(1022, 'Eternal gem')
	.tertiary(1022, 'Imbued heart');

export default new SimpleMonster({
	id: 7395,
	name: 'Monstrous basilisk',
	table: MonstrousBasiliskTable,
	aliases: ['monstrous basilisk']
});
