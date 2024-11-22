import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { NechryaelPreTable } from '../low/n-s/Nechryael';

const NechryarchTable = new LootTable()
	.every('Malicious ashes')
	.every(NechryaelPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(124, 'Mist battlestaff')
	.tertiary(124, 'Dust battlestaff')
	.tertiary(433, 'Eternal gem')
	.tertiary(434, 'Imbued heart');

export default new SimpleMonster({
	id: 7411,
	name: 'Nechryarch',
	table: NechryarchTable,
	aliases: ['nechryarch']
});
