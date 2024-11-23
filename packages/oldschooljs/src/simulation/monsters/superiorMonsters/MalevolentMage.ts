import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { InfernalMagePreTable } from '../low/g-m/InfernalMage';

const MalevolentMageTable = new LootTable()
	.every('Bones')
	.every(InfernalMagePreTable, 3)

	/* Superior Slayer tertiary */
	.tertiary(274, 'Mist battlestaff')
	.tertiary(275, 'Dust battlestaff')
	.tertiary(960, 'Eternal gem')
	.tertiary(960, 'Imbued heart');

export default new SimpleMonster({
	id: 7396,
	name: 'Malevolent Mage',
	table: MalevolentMageTable,
	aliases: ['malevolent mage']
});
