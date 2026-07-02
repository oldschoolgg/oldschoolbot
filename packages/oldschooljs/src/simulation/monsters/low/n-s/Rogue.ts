import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const RogueTable: LootTable = new LootTable()
	// Weaponry
	.add('Iron dagger(p)', 1, 1 / 128)

	// Other
	.add('Coins', [25, 40], 1 / 1.185)
	.add('Air rune', 8, 1 / 16)
	.add('Jug of wine', 1, 1 / 21.33)
	.add('Lockpick', 1, 1 / 25.6);

export const Rogue: SimpleMonster = new SimpleMonster({
	id: 526,
	name: 'Rogue',
	pickpocketTable: RogueTable,
	aliases: ['rogue']
});
