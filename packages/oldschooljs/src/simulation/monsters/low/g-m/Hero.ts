import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const HeroTable = new LootTable({ limit: 128 })
	.add('Coins', [200, 300], 105)
	.add('Death rune', 2, 8)
	.add('Jug of wine', 6)
	.add('Blood rune', 5)
	.add('Fire orb', 2)
	.add('Diamond', 1)
	.add('Gold ore', 1)
	.tertiary(1_400, 'Clue scroll (elite)');

export const Hero: SimpleMonster = new SimpleMonster({
	id: 3295,
	name: 'Hero',
	pickpocketTable: HeroTable,
	aliases: ['hero']
});
