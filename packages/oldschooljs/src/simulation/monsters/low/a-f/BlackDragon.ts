import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
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

const BlackDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Black dragonhide')

	/* Weapons and armour */
	.add('Mithril 2h sword', 1, 4)
	.add('Mithril axe', 1, 3)
	.add('Mithril battleaxe', 1, 3)
	.add('Rune knife', 2, 3)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant platebody', 1, 1)
	.add('Rune longsword', 1, 1)

	/* Runes and ammunition */
	.add('Adamant javelin', 30, 20)
	.add('Fire rune', 50, 8)
	.add('Adamant dart(p)', 16, 7)
	.add('Law rune', 10, 5)
	.add('Blood rune', 15, 3)
	.add('Air rune', 75, 1)

	/* Coins */
	.add('Coins', 196, 40)
	.add('Coins', 330, 10)
	.add('Coins', 690, 1)

	/* Other */
	.add('Dragon javelin heads', 10, 6)
	.add('Adamantite bar', 1, 3)
	.add('Chocolate cake', 1, 3)

	/* RDT */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(35, 'Ensouled dragon head')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(500, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

const BlackDragonWildyCaveTable = new LootTable()
	.every(BlackDragonTable)
	.add(WildySlayerCaveTable, 1, 91)
	.add(new LootTable(), 1, 9);

export default new SimpleMonster({
	id: 252,
	name: 'Black Dragon',
	table: BlackDragonTable,
	wildyCaveTable: BlackDragonWildyCaveTable,
	aliases: ['black dragon', 'black drags']
});
