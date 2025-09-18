import CommonSeedDropTable from '@/simulation/subtables/CommonSeedDropTable.js';
import HerbDropTable from '@/simulation/subtables/HerbDropTable.js';
import RareDropTable from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
// TODO: check back for wiki drop table update
const ZygomiteTable = new LootTable()
	.every('Ashes')

	/* Weapons and armour */
	.add('Steel axe', 1, 10)
	.add('Steel 2h sword', 1, 10)
	.add('Mithril full helm', 1, 5)
	.add('Rune full helm', 1, 5)

	/* Runes and ammunition */
	.add('Nature rune', 5, 15)
	.add('Law rune', [10, 20], 10)
	.add('Earth rune', 15, 10)

	/* Herbs */
	.add(HerbDropTable, 1, 16)

	/* Seeds */
	.add(CommonSeedDropTable, 1, 10)

	/* Other */
	.add('Coins', [44, 460], 9)
	.add('Supercompost', [1, 3], 7)
	.add('Mort myre fungus', [1, 5], 7)
	.add('Clay', 1, 7)
	.add('Fungicide', 1, 7)

	/* RDT */
	.add(RareDropTable, 1, 1);

export default new SimpleMonster({
	id: 537,
	name: 'Zygomite',
	table: ZygomiteTable,
	aliases: ['mutated zygomite', 'zygomite']
});
