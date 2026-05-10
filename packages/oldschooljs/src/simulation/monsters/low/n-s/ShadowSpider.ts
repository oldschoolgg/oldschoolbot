import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const ShadowSpiderTable: LootTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export const ShadowSpider: SimpleMonster = new SimpleMonster({
	id: 3016,
	name: 'Shadow spider',
	table: ShadowSpiderTable,
	aliases: ['shadow spider']
});
