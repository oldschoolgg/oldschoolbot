import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { RockslugTable } from '../low/n-s/Rockslug.js';

const GiantRockslugTable: LootTable = new LootTable()
	.every(RockslugTable, 3)

	/* Superior Slayer tertiary */
	.tertiary(354, 'Mist battlestaff')
	.tertiary(354, 'Dust battlestaff')
	.tertiary(1240, 'Eternal gem')
	.tertiary(1240, 'Imbued heart');

export const GiantRockslug: SimpleMonster = new SimpleMonster({
	id: 7392,
	name: 'Giant rockslug',
	table: GiantRockslugTable,
	aliases: ['giant rockslug']
});
