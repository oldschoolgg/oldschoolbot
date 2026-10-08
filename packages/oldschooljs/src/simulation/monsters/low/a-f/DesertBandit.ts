import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const DesertBanditTable = new LootTable().add('Coins', 30, 70).add('Antipoison(1)', 1, 15).add('Lockpick', 1, 15);

export const DesertBandit: SimpleMonster = new SimpleMonster({
	id: 690,
	name: 'Desert Bandit',
	pickpocketTable: DesertBanditTable,
	aliases: ['desert bandit']
});
