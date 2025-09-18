import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { KuraskPreTable } from '../low/g-m/Kurask.js';

const KingKuraskTable = new LootTable()
	.every('Bones')
	.every(KuraskPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')
	.tertiary(3000, 'Kurask head')

	/* Superior Slayer tertiary */
	.tertiary(171, 'Mist battlestaff')
	.tertiary(172, 'Dust battlestaff')
	.tertiary(600, 'Eternal gem')
	.tertiary(600, 'Imbued heart');

export default new SimpleMonster({
	id: 7405,
	name: 'King kurask',
	table: KingKuraskTable,
	aliases: ['king kurask']
});
