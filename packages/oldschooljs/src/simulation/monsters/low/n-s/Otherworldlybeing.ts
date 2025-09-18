import HerbDropTable from '@/simulation/subtables/HerbDropTable.js';
import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const OtherworldlybeingTable = new LootTable({ limit: 128 })
	/* Runes */
	.add('Nature rune', 5, 9)
	.add('Chaos rune', 4, 8)
	.add('Law rune', 2, 7)
	.add('Cosmic rune', 2, 5)
	.add('Death rune', 2, 4)
	.add('Blood rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 10)

	/* Other */
	.add('Coins', 15, 59)
	.add('Ruby ring', 1, 2)
	.add('Mithril mace', 1, 1)
	.add('Mackerel', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 3);

export default new SimpleMonster({
	id: 2843,
	name: 'Otherworldly being',
	table: OtherworldlybeingTable,
	aliases: ['otherworldly being']
});
