import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { DarkBeastPreTable } from '../low/a-f/DarkBeast';

const NightBeastTable = new LootTable()
	.every('Big bones')
	.every(DarkBeastPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')
	.tertiary(120, 'Clue scroll (elite)')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone')

	/* Superior Slayer tertiary */
	.tertiary(73, 'Mist battlestaff')
	.tertiary(73, 'Dust battlestaff')
	.tertiary(255, 'Eternal gem')
	.tertiary(254, 'Imbued heart');

export default new SimpleMonster({
	id: 7409,
	name: 'Night beast',
	table: NightBeastTable,
	aliases: ['night beast']
});
