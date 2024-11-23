import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { BloodveldPreTable } from '../low/a-f/Bloodveld';

const InsatiableBloodveldTable = new LootTable()
	.every('Vile ashes')
	.every('Ensouled bloodveld head')
	.every(BloodveldPreTable, 3)
	.tertiary(26, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(256, 'Mist battlestaff')
	.tertiary(255, 'Dust battlestaff')
	.tertiary(894, 'Eternal gem')
	.tertiary(895, 'Imbued heart');

export default new SimpleMonster({
	id: 7397,
	name: 'Insatiable Bloodveld',
	table: InsatiableBloodveldTable,
	aliases: ['insatiable bloodveld']
});
