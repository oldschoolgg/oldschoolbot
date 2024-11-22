import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 6850)
	.add('Blighted anglerfish', [1, 2], 5150)
	.add('Blighted manta ray', [1, 2], 5150)
	.add('Blighted karambwan', [1, 2], 3425)
	.add('Blighted teleport spell sack', [1, 10], 3425)
	.add('Blighted ancient ice sack', [1, 10], 3425)
	.add('Blighted vengeance sack', [1, 10], 3425)
	.add('Blighted super restore(4)', 1, 1710)
	.add('Revenant cave teleport', 1, 1710)
	.add('Dareeyak teleport', 1, 342)
	.add('Wilderness crabs teleport', 1, 342)
	.add('Carrallanger teleport', 1, 342)
	.add('Paddewwa teleport', 1, 342)
	.add('Annakarl teleport', 1, 342)
	.add('Lassar teleport', 1, 342)
	.add('Kharyrll teleport', 1, 342)
	.add('Senntisten teleport', 1, 342)
	.add('Ghorrock teleport', 1, 342)
	.add('Target teleport', 1, 342)
	.add('Magic shortbow scroll', 1, 137)
	.add('Ring of wealth scroll', 1, 137)
	.add('Trouver parchment', 2, 34)
	.add('Looting bag note', 1, 34);

export const JellyPreTable = new LootTable()
	/* Weapons and armour */
	.add('Steel battleaxe', 1, 11)
	.add('Steel 2h sword', 1, 7)
	.add('Steel axe', 1, 3)
	.add('Mithril kiteshield', 1, 2)
	.add('Mithril boots', 1, 1)
	.add('Rune full helm', 1, 1)

	/* Coins */
	.add('Coins', 102, 39)
	.add('Coins', 44, 30)
	.add('Coins', 220, 10)
	.add('Coins', 11, 7)
	.add('Coins', 460, 2)

	/* Other */
	.add('Chaos rune', 15, 5)
	.add('Death rune', 5, 3)
	.add('Gold bar', 1, 2)
	.add('Thread', 10, 1)

	/* Gem drop table */
	.add(GemTable, 1, 4);

const JellyTable = new LootTable()
	.every(JellyPreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

const JellyWildyCaveTable = new LootTable()
	.every(JellyTable)
	.add(WildySlayerCaveTable, 1, 76)
	.add(new LootTable(), 1, 24);

export default new SimpleMonster({
	id: 437,
	name: 'Jelly',
	table: JellyTable,
	wildyCaveTable: JellyWildyCaveTable,
	aliases: ['jelly', 'jello']
});
