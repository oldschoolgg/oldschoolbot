import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const AlKharidWarrior: SimpleMonster = new SimpleMonster({
	id: 3292,
	name: 'Al-Kharid warrior',
	pickpocketTable: new LootTable().add('Coins', 18),
	aliases: ['al-kharid warrior', 'alkharid warrior']
});
