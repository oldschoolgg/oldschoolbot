import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { DrakePreTable } from '../low/a-f/Drake';

const GuardianDrakeTable = new LootTable()
	.every('Drake bones')
	.every(DrakePreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(104, 'Mist battlestaff')
	.tertiary(104, 'Dust battlestaff')
	.tertiary(364, 'Eternal gem')
	.tertiary(363, 'Imbued heart');

export default new SimpleMonster({
	id: 10_400,
	name: 'Guardian Drake',
	table: GuardianDrakeTable,
	aliases: ['guardian drake']
});
