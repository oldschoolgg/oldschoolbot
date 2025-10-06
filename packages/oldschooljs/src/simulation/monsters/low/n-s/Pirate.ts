import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PirateTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Weapons and armour */
	.add('Iron bolts', [2, 12], 10)
	.add('Iron dagger', 1, 6)
	.add('Bronze scimitar', 1, 4)
	.add('Iron platebody', 1, 1)

	/* Runes and ammunition */
	.add('Chaos rune', 2, 6)
	.add('Nature rune', 2, 5)
	.add('Bronze arrow', 9, 3)
	.add('Bronze arrow', 12, 2)
	.add('Air rune', 10, 2)
	.add('Earth rune', 9, 2)
	.add('Fire rune', 5, 2)
	.add('Law rune', 2, 1)

	/* Coins */
	.add('Coins', 4, 29)
	.add('Coins', 25, 13)
	.add('Coins', 7, 8)
	.add('Coins', 12, 6)
	.add('Coins', 35, 4)
	.add('Coins', 55, 1)

	/* Other */
	.add('Right eye patch', 1, 12)
	.add("Chef's hat", 1, 1)
	.add('Iron bar', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 1);

export default new SimpleMonster({
	id: 521,
	name: 'Pirate',
	table: PirateTable,
	aliases: ['pirate']
});
