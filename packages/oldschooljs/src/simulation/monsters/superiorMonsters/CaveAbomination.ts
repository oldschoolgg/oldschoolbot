import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { CaveHorrorPreTable } from '../low/a-f/CaveHorror';

const CaveAbominationTable = new LootTable()
	.every('Big bones')
	.every('Ensouled horror head')
	.every(CaveHorrorPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone')

	/* Superior Slayer tertiary */
	.tertiary(224, 'Mist battlestaff')
	.tertiary(223, 'Dust battlestaff')
	.tertiary(783, 'Eternal gem')
	.tertiary(783, 'Imbued heart');

export default new SimpleMonster({
	id: 7401,
	name: 'Cave abomination',
	table: CaveAbominationTable,
	aliases: ['cave abomination']
});
