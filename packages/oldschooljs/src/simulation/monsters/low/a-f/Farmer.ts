import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const FarmerTable: LootTable = new LootTable().add('Coins', 9, 98).add('Potato seed', 1, 2).tertiary(257_211, 'Rocky');

export const Farmer: SimpleMonster = new SimpleMonster({
	id: 3114,
	name: 'Farmer',
	pickpocketTable: FarmerTable,
	aliases: ['farmer']
});
