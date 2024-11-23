import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { AberrantSpectrePreTable } from '../low/a-f/AberrantSpectre';

const AbhorrentSpectreTable = new LootTable()
	.every(AberrantSpectrePreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(215, 'Mist battlestaff')
	.tertiary(215, 'Dust battlestaff')
	.tertiary(754, 'Eternal gem')
	.tertiary(754, 'Imbued heart');

export default new SimpleMonster({
	id: 7402,
	name: 'Abhorrent spectre',
	table: AbhorrentSpectreTable,
	aliases: ['abhorrent spectre']
});
