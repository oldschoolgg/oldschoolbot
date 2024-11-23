import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { TurothPreTable } from '../low/t-z/Turoth';

const SpikedTurothTable = new LootTable()
	.every('Bones')
	.every(TurothPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(236, 'Mist battlestaff')
	.tertiary(236, 'Dust battlestaff')
	.tertiary(825, 'Eternal gem')
	.tertiary(826, 'Imbued heart');

export default new SimpleMonster({
	id: 10_397,
	name: 'Spiked Turoth',
	table: SpikedTurothTable,
	aliases: ['spiked turoth']
});
