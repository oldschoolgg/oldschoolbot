import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { DustDevilPreTable } from '../low/a-f/DustDevil.js';

const ChokeDevilTable: LootTable = new LootTable()
	.every('Bones')
	.every(DustDevilPreTable, 3)

	/* Superior Slayer tertiary */
	.tertiary(194, 'Mist battlestaff')
	.tertiary(194, 'Dust battlestaff')
	.tertiary(678, 'Eternal gem')
	.tertiary(679, 'Imbued heart');

export const ChokeDevil: SimpleMonster = new SimpleMonster({
	id: 7404,
	name: 'Choke devil',
	table: ChokeDevilTable,
	aliases: ['choke devil']
});
