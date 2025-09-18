import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const GiantSpiderTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 2477,
	name: 'Giant spider',
	table: GiantSpiderTable,
	aliases: ['giant spider']
});
