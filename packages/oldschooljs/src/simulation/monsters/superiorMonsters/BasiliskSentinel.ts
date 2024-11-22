import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { BasiliskKnightPreTable } from '../low/a-f/BasiliskKnight';

const BasiliskSentinelTable = new LootTable()
	.every('Big bones')
	.every(BasiliskKnightPreTable, 3)
	.tertiary(19, 'Clue scroll (hard)')
	.tertiary(256, 'Mystic hat (light)')
	.tertiary(400, 'Long bone')
	.tertiary(1000, 'Basilisk head')
	.tertiary(1000, 'Basilisk jaw')
	.tertiary(5013, 'Curved bone')

	/* Superior Slayer tertiary */
	.tertiary(215, 'Mist battlestaff')
	.tertiary(215, 'Dust battlestaff')
	.tertiary(754, 'Eternal gem')
	.tertiary(754, 'Imbued heart');

export default new SimpleMonster({
	id: 9258,
	name: 'Basilisk Sentinel',
	table: BasiliskSentinelTable,
	aliases: ['basilisk sentinel']
});
