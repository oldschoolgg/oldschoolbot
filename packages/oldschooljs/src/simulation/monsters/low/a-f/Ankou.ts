import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import CommonSeedDropTable from '../../../subtables/CommonSeedDropTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 11900)
	.add('Blighted anglerfish', [1, 2], 8930)
	.add('Blighted manta ray', [1, 2], 8930)
	.add('Blighted karambwan', [1, 2], 5950)
	.add('Blighted teleport spell sack', [1, 10], 5950)
	.add('Blighted ancient ice sack', [1, 10], 5950)
	.add('Blighted vengeance sack', [1, 10], 5950)
	.add('Blighted super restore(4)', 1, 2980)
	.add('Revenant cave teleport', 1, 2980)
	.add('Dareeyak teleport', 1, 595)
	.add('Wilderness crabs teleport', 1, 595)
	.add('Carrallanger teleport', 1, 595)
	.add('Paddewwa teleport', 1, 595)
	.add('Annakarl teleport', 1, 595)
	.add('Lassar teleport', 1, 595)
	.add('Kharyrll teleport', 1, 595)
	.add('Senntisten teleport', 1, 595)
	.add('Ghorrock teleport', 1, 595)
	.add('Target teleport', 1, 595)
	.add('Magic shortbow scroll', 1, 238)
	.add('Ring of wealth scroll', 1, 238)
	.add('Trouver parchment', 2, 59)
	.add('Looting bag note', 1, 59);

const AnkouTable = new LootTable({ limit: 100 })
	.every('Bones')

	.oneIn(33, 'Left skull half')

	/* Weapons and armor */
	.add('Black knife', 1, 1)
	.add('Black robe', 1, 1)

	/* Runes and ammunition */
	.add('Death rune', 10, 10)
	.add('Blood rune', 11, 6)
	.add('Law rune', 2, 6)
	.add('Adamant arrow', [5, 14], 4)
	.add('Blood rune', 5, 3)

	/* Herbs */
	.add(HerbDropTable, 1, 3)

	/* Seeds */
	.add(CommonSeedDropTable, 1, 1)

	/* Materials */
	.add('Pure essence', 15, 5)
	.add('Mithril ore', [3, 7], 2)

	/* Coins */
	.add('Coins', 8, 33)
	.add('Coins', [5, 204], 10)

	/* Other */
	.add('Bass', 1, 2)
	.add('Weapon poison', 1, 2)
	.add('Fried mushrooms', 1, 1)

	/* RDT */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(512, 'Clue scroll (hard)');

const AnkouWildyCaveTable = new LootTable()
	.every(AnkouTable)
	.add(WildySlayerCaveTable, 1, 66)
	.add(new LootTable(), 1, 34);

export default new SimpleMonster({
	id: 2514,
	name: 'Ankou',
	table: AnkouTable,
	wildyCaveTable: AnkouWildyCaveTable,
	aliases: ['ankou', 'ank']
});
