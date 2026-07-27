import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const KnightOfArdougne: SimpleMonster = new SimpleMonster({
	id: 3297,
	name: 'Knight of Ardougne',
	pickpocketTable: new LootTable().add('Coins', 50).tertiary(257_211, 'Rocky'),
	aliases: ['ardy knight', 'ardougne knight', 'knight of ardougne']
});
