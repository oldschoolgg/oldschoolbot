import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GhoulTable: LootTable = new LootTable().tertiary(5000, 'Ghoul champion scroll').every('Bones');

export const Ghoul: SimpleMonster = new SimpleMonster({
	id: 289,
	name: 'Ghoul',
	table: GhoulTable,
	aliases: ['ghoul']
});
