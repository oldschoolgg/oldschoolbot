import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MonkeyTable: LootTable = new LootTable().every('Monkey bones').tertiary(35, 'Ensouled monkey head');

export const Monkey: SimpleMonster = new SimpleMonster({
	id: 2848,
	name: 'Monkey',
	table: MonkeyTable,
	aliases: ['monkey']
});
