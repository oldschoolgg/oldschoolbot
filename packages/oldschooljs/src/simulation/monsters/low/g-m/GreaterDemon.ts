import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 12200)
	.add('Blighted anglerfish', [1, 2], 9170)
	.add('Blighted manta ray', [1, 2], 9170)
	.add('Blighted karambwan', [1, 2], 6130)
	.add('Blighted teleport spell sack', [1, 10], 6130)
	.add('Blighted ancient ice sack', [1, 10], 6130)
	.add('Blighted vengeance sack', [1, 10], 6130)
	.add('Blighted super restore(4)', 1, 3070)
	.add('Revenant cave teleport', 1, 3070)
	.add('Dareeyak teleport', 1, 613)
	.add('Wilderness crabs teleport', 1, 613)
	.add('Carrallanger teleport', 1, 613)
	.add('Paddewwa teleport', 1, 613)
	.add('Annakarl teleport', 1, 613)
	.add('Lassar teleport', 1, 613)
	.add('Kharyrll teleport', 1, 613)
	.add('Senntisten teleport', 1, 613)
	.add('Ghorrock teleport', 1, 613)
	.add('Target teleport', 1, 613)
	.add('Magic shortbow scroll', 1, 245)
	.add('Ring of wealth scroll', 1, 245)
	.add('Trouver parchment', 2, 61)
	.add('Looting bag note', 1, 61);

const GreaterDemonTable = new LootTable({ limit: 128 })
	.every('Vile ashes')

	/* Weapons and armor */
	.add('Steel 2h sword', 1, 4)
	.add('Steel axe', 1, 3)
	.add('Steel battleaxe', 1, 3)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant platelegs', 1, 1)
	.add('Rune full helm', 1, 1)

	/* Runes and ammunition */
	.add('Fire rune', 75, 8)
	.add('Chaos rune', 15, 3)
	.add('Fire rune', 37, 1)
	.add('Death rune', 5, 3)

	/* Coins */
	.add('Coins', 132, 40)
	.add('Coins', 44, 29)
	.add('Coins', 220, 10)
	.add('Coins', 11, 7)
	.add('Coins', 460, 1)

	/* Other */
	.add('Tuna', 1, 3)
	.add('Gold bar', 1, 2)
	.add('Thread', 10, 1)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(40, 'Ensouled demon head')
	.tertiary(128, 'Clue scroll (hard)');

const GreaterDemonWildyCaveTable = new LootTable()
	.every(GreaterDemonTable)
	.add(WildySlayerCaveTable, 1, 68)
	.add(new LootTable(), 1, 32);

export default new SimpleMonster({
	id: 2025,
	name: 'Greater Demon',
	table: GreaterDemonTable,
	wildyCaveTable: GreaterDemonWildyCaveTable,
	aliases: ['greater demon', 'greater', 'greaters']
});
