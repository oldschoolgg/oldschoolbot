import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const BlackGuardTable: LootTable = new LootTable()
	.every('Bones')
	.tertiary(128, 'Clue scroll (medium)')
	/* Weapons and Armour*/
	.add('Bronze med helm', 1, 11)
	.add('Bronze battleaxe', 1, 4)
	.add('Bronze bolts', 6, 4)
	.add('Bronze warhammer', 1, 4)
	.add('Bronze pickaxe', 1, 4)
	.add('Iron battleaxe', 1, 3)
	.add('Black warhammer', 1, 2)

	/* Runes*/
	.add('Chaos rune', 2, 4)
	.add('Nature rune', 2, 4)

	/* Materials */
	.add('Coal', 1, 2)
	.add('Copper ore', 1, 3)
	.add('Bronze bar', 1, 4)
	.add('Iron bar', 1, 3)

	/* Other */
	.add('Coins', [4, 42], 22)
	.add('Hammer', 1, 8)
	.add('Keg of beer', 1, 2)
	.add('Bucket of water', 1, 4)
	.add('Ring mould', 1, 4)
	/* Gem drop table */
	.add(GemTable);

export const BlackGuard: SimpleMonster = new SimpleMonster({
	id: 6046,
	name: 'Black Guard',
	table: BlackGuardTable,
	aliases: ['black guard']
});
