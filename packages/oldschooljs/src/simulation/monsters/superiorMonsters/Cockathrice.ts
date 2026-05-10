import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { CockatricePreTable } from '../low/a-f/Cockatrice.js';

const CockathriceTable: LootTable = new LootTable()
	.every('Bones')
	.every(CockatricePreTable, 3)

	/* Tertiary */
	.tertiary(13, 'Clue scroll (medium)')
	.tertiary(1000, 'Cockatrice head')

	/* Superior Slayer tertiary */
	.tertiary(340, 'Mist battlestaff')
	.tertiary(340, 'Dust battlestaff')
	.tertiary(1190, 'Eternal gem')
	.tertiary(1190, 'Imbued heart');

export const Cockathrice: SimpleMonster = new SimpleMonster({
	id: 7393,
	name: 'Cockathrice',
	table: CockathriceTable,
	aliases: ['cockathrice']
});
