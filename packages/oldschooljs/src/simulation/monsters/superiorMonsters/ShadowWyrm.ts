import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { WyrmPreTable } from '../low/t-z/Wyrm';

const ShadowWyrmTable = new LootTable()
	.every('Wyrm bones')
	.every(WyrmPreTable, 3)
	.tertiary(26, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(207, 'Mist battlestaff')
	.tertiary(207, 'Dust battlestaff')
	.tertiary(724, 'Eternal gem')
	.tertiary(724, 'Imbued heart');

export default new SimpleMonster({
	id: 10_398,
	name: 'Shadow Wyrm',
	table: ShadowWyrmTable,
	aliases: ['shadow wyrm']
});
