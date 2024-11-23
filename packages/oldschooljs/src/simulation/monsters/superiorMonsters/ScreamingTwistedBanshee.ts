import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { TwistedBansheePreTable } from '../low/t-z/TwistedBanshee';

const ScreamingTwistedBansheeTable = new LootTable()
	.every(TwistedBansheePreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(367, 'Mist battlestaff')
	.tertiary(368, 'Dust battlestaff')
	.tertiary(1286, 'Eternal gem')
	.tertiary(1286, 'Imbued heart');

export default new SimpleMonster({
	id: 7391,
	name: 'Screaming twisted banshee',
	table: ScreamingTwistedBansheeTable,
	aliases: ['screaming twisted banshee']
});
