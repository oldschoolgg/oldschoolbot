import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const PaladinTable: LootTable = new LootTable()
	.every('Coins', 80)
	.every('Chaos rune', 2)
	.tertiary(1_000, 'Clue scroll (hard)')
	.tertiary(127_056, 'Rocky');

export const Paladin: SimpleMonster = new SimpleMonster({
	id: 1144,
	name: 'Paladin',
	pickpocketTable: PaladinTable,
	aliases: ['paladin']
});
