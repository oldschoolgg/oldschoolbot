import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const FremennikCitizen: SimpleMonster = new SimpleMonster({
	id: 3937,
	name: 'Fremennik citizen',
	pickpocketTable: new LootTable().add('Coins', 40).tertiary(257_211, 'Rocky'),
	aliases: ['fremennik citizen']
});
