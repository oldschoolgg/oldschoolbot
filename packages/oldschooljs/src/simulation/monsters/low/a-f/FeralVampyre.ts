import { HerbDropTable } from '@/simulation/subtables/HerbDropTable.js';
import { UncommonSeedDropTable } from '@/simulation/subtables/index.js';
import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const FeralVampyreTable = new LootTable({ limit: 128 })
	.every('Vampyre dust')

	/* Runes */
	.add('Earth rune', 4, 10)
	.add('Death rune', 2, 10)
	.add('Chaos rune', 3, 8)
	.add('Blood rune', 1, 5)
	.add('Blood rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 10)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 19)

	/* Other */
	.add('Coins', 15, 40)
	.add('Black axe', 1, 3)
	.add('Earth talisman', 1, 2)

	/* Gem drop table */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 3234,
	name: 'Feral Vampyre',
	table: FeralVampyreTable,
	aliases: ['feral vampyre', 'vampyres', 'vampyre']
});
