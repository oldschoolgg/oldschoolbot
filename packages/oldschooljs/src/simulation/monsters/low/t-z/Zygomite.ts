import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import CommonSeedDropTable from '../../../subtables/CommonSeedDropTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable from '../../../subtables/RareDropTable';

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
