import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { WarpedJellyPreTable } from '../low/t-z/WarpedJelly';

const VitreousWarpedJellyTable = new LootTable()
	.every(WarpedJellyPreTable, 3)
	.tertiary(7, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(248, 'Mist battlestaff')
	.tertiary(248, 'Dust battlestaff')
	.tertiary(867, 'Eternal gem')
	.tertiary(867, 'Imbued heart');

export default new SimpleMonster({
	id: 7400,
	name: 'Vitreous warped Jelly',
	table: VitreousWarpedJellyTable,
	aliases: ['vitreous warped jelly']
});
