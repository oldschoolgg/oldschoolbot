import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 11100)
	.add('Blighted anglerfish', [1, 2], 8400)
	.add('Blighted manta ray', [1, 2], 8400)
	.add('Blighted karambwan', [1, 2], 5590)
	.add('Blighted teleport spell sack', [1, 10], 5590)
	.add('Blighted ancient ice sack', [1, 10], 5590)
	.add('Blighted vengeance sack', [1, 10], 5590)
	.add('Blighted super restore(4)', 1, 2790)
	.add('Revenant cave teleport', 1, 2790)
	.add('Dareeyak teleport', 1, 559)
	.add('Wilderness crabs teleport', 1, 559)
	.add('Carrallanger teleport', 1, 559)
	.add('Paddewwa teleport', 1, 559)
	.add('Annakarl teleport', 1, 559)
	.add('Lassar teleport', 1, 559)
	.add('Kharyrll teleport', 1, 559)
	.add('Senntisten teleport', 1, 559)
	.add('Ghorrock teleport', 1, 559)
	.add('Target teleport', 1, 559)
	.add('Magic shortbow scroll', 1, 223)
	.add('Ring of wealth scroll', 1, 223)
	.add('Trouver parchment', 2, 56)
	.add('Looting bag note', 1, 56);

const GreenDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Green dragonhide')

	/* Weapons and armour */
	.add('Steel platelegs', 1, 4)
	.add('Steel battleaxe', 1, 3)
	.add('Mithril axe', 1, 3)
	.add('Mithril spear', 1, 2)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant full helm', 1, 1)
	.add('Rune dagger', 1, 1)

	/* Runes*/
	.add('Water rune', 75, 8)
	.add('Nature rune', 15, 5)
	.add('Law rune', 3, 3)
	.add('Fire rune', 37, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Coins */
	.add('Coins', 44, 29)
	.add('Coins', 132, 25)
	.add('Coins', 200, 10)
	.add('Coins', 11, 5)
	.add('Coins', 440, 1)

	/* Other */
	.add('Bass', 1, 3)
	.add('Adamantite ore', 1, 3)

	/* Gem drop table */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(35, 'Ensouled dragon head')
	.tertiary(128, 'Clue scroll (hard)');

const GreenDragonWildyCaveTable = new LootTable()
	.every(GreenDragonTable)
	.add(WildySlayerCaveTable, 1, 62)
	.add(new LootTable(), 1, 38);

export default new SimpleMonster({
	id: 260,
	name: 'Green dragon',
	table: GreenDragonTable,
	wildyCaveTable: GreenDragonWildyCaveTable,
	aliases: ['green dragon', 'green drags']
});
