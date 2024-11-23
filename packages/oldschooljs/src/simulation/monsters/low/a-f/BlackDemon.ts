import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 8200)
	.add('Blighted anglerfish', [1, 2], 6150)
	.add('Blighted manta ray', [1, 2], 6150)
	.add('Blighted karambwan', [1, 2], 4100)
	.add('Blighted teleport spell sack', [1, 10], 4100)
	.add('Blighted ancient ice sack', [1, 10], 4100)
	.add('Blighted vengeance sack', [1, 10], 4100)
	.add('Blighted super restore(4)', 1, 2050)
	.add('Revenant cave teleport', 1, 2050)
	.add('Dareeyak teleport', 1, 410)
	.add('Wilderness crabs teleport', 1, 410)
	.add('Carrallanger teleport', 1, 410)
	.add('Paddewwa teleport', 1, 410)
	.add('Annakarl teleport', 1, 410)
	.add('Lassar teleport', 1, 410)
	.add('Kharyrll teleport', 1, 410)
	.add('Senntisten teleport', 1, 410)
	.add('Ghorrock teleport', 1, 410)
	.add('Target teleport', 1, 410)
	.add('Magic shortbow scroll', 1, 164)
	.add('Ring of wealth scroll', 1, 164)
	.add('Trouver parchment', 2, 41)
	.add('Looting bag note', 1, 41);

const BlackDemonTable = new LootTable()
	.every('Malicious ashes')

	/* Weapons and armour */
	.add('Black sword', 1, 4)
	.add('Steel battleaxe', 1, 3)
	.add('Black axe', 1, 2)
	.add('Mithril kiteshield', 1, 1)
	.add('Rune med helm', 1, 1)
	.add('Rune chainbody', 1, 1)

	/* Runes and ammunition */
	.add('Air rune', 50, 8)
	.add('Chaos rune', 10, 7)
	.add('Blood rune', 7, 4)
	.add('Fire rune', 37, 1)
	.add('Law rune', 3, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 23)

	/* Coins */
	.add('Coins', 132, 40)
	.add('Coins', 30, 7)
	.add('Coins', 44, 6)
	.add('Coins', 220, 6)
	.add('Coins', 460, 1)

	/* Other */
	.add('Lobster', 1, 3)
	.add('Adamantite bar', 1, 2)
	.add('Defence potion(3)', 1, 1)

	/* RDT */
	.add(RareDropTable, 1, 1)
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(35, 'Ensouled demon head')
	.tertiary(128, 'Clue scroll (hard)');

const BlackDemonWildyCaveTable = new LootTable()
	.every(BlackDemonTable)
	.add(WildySlayerCaveTable, 1, 91)
	.add(new LootTable(), 1, 9);

export default new SimpleMonster({
	id: 240,
	name: 'Black Demon',
	table: BlackDemonTable,
	wildyCaveTable: BlackDemonWildyCaveTable,
	aliases: ['black demon']
});
