import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const WolfTable = new LootTable().every('Wolf bones').tertiary(128, 'Clue scroll (beginner)');

export default new SimpleMonster({
	id: 106,
	name: 'Wolf',
	table: WolfTable,
	aliases: ['wolf']
});
