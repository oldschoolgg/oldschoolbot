import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GuardBanditTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1027,
	name: 'Guard Bandit',
	table: GuardBanditTable,
	aliases: ['guard bandit']
});
