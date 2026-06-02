import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { BloodveldPreTable } from '../low/a-f/Bloodveld.js';

const InsatiableBloodveldTable: LootTable = new LootTable()
	.every('Vile ashes')
	.every('Ensouled bloodveld head')
	.every(BloodveldPreTable, 3)
	.tertiary(26, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(256, 'Mist battlestaff')
	.tertiary(255, 'Dust battlestaff')
	.tertiary(894, 'Eternal gem')
	.tertiary(895, 'Imbued heart');

export const InsatiableBloodveld: SimpleMonster = new SimpleMonster({
	id: 7397,
	name: 'Insatiable Bloodveld',
	table: InsatiableBloodveldTable,
	aliases: ['insatiable bloodveld']
});
