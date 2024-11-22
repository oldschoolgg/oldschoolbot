import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { HydraPreTable } from '../low/g-m/Hydra';

const ColossalHydraTable = new LootTable()
	.every('Hydra bones')
	.every(HydraPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')
	.tertiary(51, 'Clue scroll (elite)')

	/* Superior Slayer tertiary */
	.tertiary(46, 'Mist battlestaff')
	.tertiary(46, 'Dust battlestaff')
	.tertiary(160, 'Eternal gem')
	.tertiary(160, 'Imbued heart');

export default new SimpleMonster({
	id: 10_402,
	name: 'Colossal Hydra',
	table: ColossalHydraTable,
	aliases: ['colossal hydra']
});
