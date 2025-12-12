import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MenaphiteThug: SimpleMonster = new SimpleMonster({
	id: 3549,
	name: 'Menaphite Thug',
	pickpocketTable: new LootTable().add('Coins', 60).tertiary(257_211, 'Rocky'),
	aliases: ['menaphite thug', 'menaphite', 'thug']
});
