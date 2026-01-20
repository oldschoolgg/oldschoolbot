import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const BeardedBandit: SimpleMonster = new SimpleMonster({
	id: 736,
	name: 'Bearded Pollnivnian Bandit',
	table: new LootTable({ limit: 5 }).every('Bones').add('Coins', [10, 300]),
	pickpocketTable: new LootTable().add('Coins', 40),
	aliases: ['bearded pollnivnian bandit', 'pollnivnian bandit', 'bearded bandit']
});
