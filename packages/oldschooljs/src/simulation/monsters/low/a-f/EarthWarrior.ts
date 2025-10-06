import { CommonSeedDropTable } from '@/simulation/subtables/CommonSeedDropTable.js';
import { HerbDropTable } from '@/simulation/subtables/HerbDropTable.js';
import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const EarthWarriorTable = new LootTable({ limit: 128 })
	.tertiary(5000, 'Earth warrior champion scroll')

	// Weapons
	.add('Steel spear', 1, 3)
	.add('Staff of earth', 1, 2)

	// Runes/ammunition
	.add('Earth rune', 12, 13)
	.add('Nature rune', 3, 9)
	.add('Chaos rune', 3, 7)
	.add('Law rune', 2, 6)
	.add('Death rune', 2, 4)
	.add('Earth rune', 60, 3)
	.add('Blood rune', 2, 1)

	.add(HerbDropTable, 1, 14)
	.add(CommonSeedDropTable, 1, 18)
	.add(GemTable, 1, 2)
	.add('Coins', 12, 18);

export default new SimpleMonster({
	id: 2840,
	name: 'Earth Warrior',
	table: EarthWarriorTable,
	aliases: ['earth warrior']
});
