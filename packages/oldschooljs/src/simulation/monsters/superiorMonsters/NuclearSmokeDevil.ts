import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { SmokeDevilPreTable } from '../low/n-s/SmokeDevil';

const NuclearSmokeDevilTable = new LootTable()
	.every('Ashes')
	.every(SmokeDevilPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')
	.tertiary(75, 'Clue scroll (elite)')

	/* Superior Slayer tertiary */
	.tertiary(57, 'Mist battlestaff')
	.tertiary(57, 'Dust battlestaff')
	.tertiary(198, 'Eternal gem')
	.tertiary(198, 'Imbued heart');

export default new SimpleMonster({
	id: 7406,
	name: 'Nuclear smoke devil',
	table: NuclearSmokeDevilTable,
	aliases: ['nuclear smoke devil']
});
