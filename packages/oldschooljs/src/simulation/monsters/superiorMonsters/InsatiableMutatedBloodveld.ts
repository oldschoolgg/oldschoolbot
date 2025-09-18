import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';
import { MutatedBloodveldPreTable } from '../low/g-m/MutatedBloodveld.js';

const InsatiableMutatedBloodveldTable = new LootTable()
	.every('Vile ashes')
	.every('Ensouled bloodveld head')
	.every(MutatedBloodveldPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')

	/* Superior Slayer tertiary */
	.tertiary(255, 'Mist battlestaff')
	.tertiary(256, 'Dust battlestaff')
	.tertiary(895, 'Eternal gem')
	.tertiary(894, 'Imbued heart');

export default new SimpleMonster({
	id: 7398,
	name: 'Insatiable mutated Bloodveld',
	table: InsatiableMutatedBloodveldTable,
	aliases: ['insatiable mutated bloodveld']
});
