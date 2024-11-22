import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { GargoylePreTable } from '../low/g-m/Gargoyle';

const MarbleGargoyleTable = new LootTable()
	.every(GargoylePreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(148, 'Mist battlestaff')
	.tertiary(148, 'Dust battlestaff')
	.tertiary(519, 'Eternal gem')
	.tertiary(518, 'Imbued heart');

export default new SimpleMonster({
	id: 7407,
	name: 'Marble gargoyle',
	table: MarbleGargoyleTable,
	aliases: ['marble gargoyle']
});
