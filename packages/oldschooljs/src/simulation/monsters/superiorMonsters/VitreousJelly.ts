import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { JellyPreTable } from '../low/g-m/Jelly';

const VitreousJellyTable = new LootTable()
	.every(JellyPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(248, 'Mist battlestaff')
	.tertiary(248, 'Dust battlestaff')
	.tertiary(867, 'Eternal gem')
	.tertiary(867, 'Imbued heart');

export default new SimpleMonster({
	id: 7399,
	name: 'Vitreous Jelly',
	table: VitreousJellyTable,
	aliases: ['vitreous jelly']
});
