import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MonkeyTable = new LootTable().every('Monkey bones').tertiary(35, 'Ensouled monkey head');

export default new SimpleMonster({
	id: 2848,
	name: 'Monkey',
	table: MonkeyTable,
	aliases: ['monkey']
});
