import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 11500)
	.add('Blighted anglerfish', [1, 2], 8620)
	.add('Blighted manta ray', [1, 2], 8620)
	.add('Blighted karambwan', [1, 2], 5780)
	.add('Blighted teleport spell sack', [1, 10], 5780)
	.add('Blighted ancient ice sack', [1, 10], 5780)
	.add('Blighted vengeance sack', [1, 10], 5780)
	.add('Blighted super restore(4)', 1, 2880)
	.add('Revenant cave teleport', 1, 2880)
	.add('Dareeyak teleport', 1, 577)
	.add('Wilderness crabs teleport', 1, 577)
	.add('Carrallanger teleport', 1, 577)
	.add('Paddewwa teleport', 1, 577)
	.add('Annakarl teleport', 1, 577)
	.add('Lassar teleport', 1, 577)
	.add('Kharyrll teleport', 1, 577)
	.add('Senntisten teleport', 1, 577)
	.add('Ghorrock teleport', 1, 577)
	.add('Target teleport', 1, 577)
	.add('Magic shortbow scroll', 1, 231)
	.add('Ring of wealth scroll', 1, 231)
	.add('Trouver parchment', 2, 58)
	.add('Looting bag note', 1, 58);

const LesserDemonTable = new LootTable()
	.every('Vile ashes')

	/* Weapons and armor*/
	.add('Steel full helm', 1, 4)
	.add('Steel axe', 1, 4)
	.add('Steel scimitar', 1, 3)
	.add('Mithril sq shield', 1, 1)
	.add('Mithril chainbody', 1, 1)
	.add('Rune med helm', 1, 1)

	/* Runes */
	.add('Fire rune', 60, 8)
	.add('Chaos rune', 12, 5)
	.add('Death rune', 3, 3)
	.add('Fire rune', 30, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 1)

	/* Coins */
	.add('Coins', 120, 40)
	.add('Coins', 40, 29)
	.add('Coins', 200, 10)
	.add('Coins', 10, 7)
	.add('Coins', 450, 1)

	/* Other */
	.add('Jug of wine', 1, 3)
	.add('Gold ore', 1, 2)

	/* Gems */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(50, 'Ensouled demon head')
	.tertiary(5000, 'Lesser demon champion scroll');

const LesserDemonWildyCaveTable = new LootTable()
	.every(LesserDemonTable)
	.add(WildySlayerCaveTable, 1, 64)
	.add(new LootTable(), 1, 36);

export default new SimpleMonster({
	id: 2005,
	name: 'Lesser demon',
	table: LesserDemonTable,
	wildyCaveTable: LesserDemonWildyCaveTable,
	aliases: ['lesser demon']
});
