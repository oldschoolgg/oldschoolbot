import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { WarpedJellyPreTable } from '../low/t-z/WarpedJelly.js';

const VitreousWarpedJellyTable: LootTable = new LootTable()
	.every(WarpedJellyPreTable, 3)
	.tertiary(7, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(248, 'Mist battlestaff')
	.tertiary(248, 'Dust battlestaff')
	.tertiary(867, 'Eternal gem')
	.tertiary(867, 'Imbued heart');

export const VitreousWarpedJelly: SimpleMonster = new SimpleMonster({
	id: 7400,
	name: 'Vitreous warped Jelly',
	table: VitreousWarpedJellyTable,
	aliases: ['vitreous warped jelly']
});
