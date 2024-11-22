import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { BansheePreTable } from '../low/a-f/Banshee';

const ScreamingBansheeTable = new LootTable()
	.every(BansheePreTable, 3)
	.tertiary(13, 'Clue scroll (easy)')

	/* Superior Slayer tertiary */
	.tertiary(368, 'Mist battlestaff')
	.tertiary(367, 'Dust battlestaff')
	.tertiary(1286, 'Eternal gem')
	.tertiary(1286, 'Imbued heart');

export default new SimpleMonster({
	id: 7390,
	name: 'Screaming banshee',
	table: ScreamingBansheeTable,
	aliases: ['screaming banshee']
});
