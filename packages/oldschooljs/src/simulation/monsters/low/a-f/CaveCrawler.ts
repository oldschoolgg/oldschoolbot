import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import VariableAllotmentSeedTable from '../../../subtables/VariableAllotmentSeedTable';

export const CaveCrawlerTable = new LootTable({ limit: 128 })
	/* Armour */
	.add('Bronze boots')

	/* Runes */
	.add('Nature rune', [3, 4], 6)
	.add('Fire rune', 12, 5)
	.add('Earth rune', 9, 2)

	/* Subtables */
	.add(VariableAllotmentSeedTable, 1, 26)
	.add(HerbDropTable, 1, 22)
	.add(GemTable)

	/* Coins */
	.add('Coins', 3, 5)
	.add('Coins', 8, 3)
	.add('Coins', 29, 3)
	.add('Coins', 10, 1)

	/* Other */
	.add('Vial of water', 1, 13)
	.add('White berries', 1, 5)
	.add('Unicorn horn dust', 1, 2)
	.add('Eye of newt')
	.add("Red spiders' eggs")
	.add('Limpwurt root')
	.add('Snape grass');

export default new SimpleMonster({
	id: 406,
	name: 'Cave Crawler',
	table: CaveCrawlerTable,
	aliases: ['cave crawler']
});
