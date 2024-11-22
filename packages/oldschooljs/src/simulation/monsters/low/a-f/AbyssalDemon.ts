import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 14500)
	.add('Blighted anglerfish', [1, 2], 10800)
	.add('Blighted manta ray', [1, 2], 7190)
	.add('Blighted karambwan', [1, 2], 7190)
	.add('Blighted teleport spell sack', [1, 10], 7190)
	.add('Blighted ancient ice sack', [1, 10], 7190)
	.add('Blighted vengeance sack', [1, 10], 7190)
	.add('Blighted super restore(4)', 1, 3600)
	.add('Revenant cave teleport', 1, 3600)
	.add('Dareeyak teleport', 1, 720)
	.add('Wilderness crabs teleport', 1, 720)
	.add('Carrallanger teleport', 1, 720)
	.add('Paddewwa teleport', 1, 720)
	.add('Annakarl teleport', 1, 720)
	.add('Lassar teleport', 1, 720)
	.add('Kharyrll teleport', 1, 720)
	.add('Senntisten teleport', 1, 720)
	.add('Ghorrock teleport', 1, 720)
	.add('Target teleport', 1, 720)
	.add('Magic shortbow scroll', 1, 288)
	.add('Ring of wealth scroll', 1, 288)
	.add('Trouver parchment', 2, 72)
	.add('Looting bag note', 1, 72);

export const AbyssalDemonPreTable = new LootTable()
	/* Weapons and armour */
	.add('Black sword', 1, 4)
	.add('Steel battleaxe', 1, 3)
	.add('Black axe', 1, 2)
	.add('Mithril kiteshield', 1, 1)
	.add('Rune chainbody', 1, 1)
	.add('Rune med helm', 1, 1)
	.oneIn(512, 'Abyssal whip')
	.oneIn(32_768, 'Abyssal dagger')

	/* Runes */
	.add('Air rune', 50, 8)
	.add('Chaos rune', 10, 6)
	.add('Blood rune', 7, 4)
	.add('Law rune', 3, 1)

	/* Seeds */
	.add(HerbDropTable, 1, 19)

	/* Materials */
	.add('Pure essence', 60, 5)
	.add('Adamantite bar', 1, 2)

	/* Coins */
	.add('Coins', 132, 35)
	.add('Coins', 220, 9)
	.add('Coins', 30, 7)
	.add('Coins', 44, 6)
	.add('Coins', 460, 1)

	/* Other */
	.add('Lobster', 1, 2)
	.add('Cosmic talisman', 1, 1)
	.add('Chaos talisman', 1, 1)
	.add('Defence potion(3)', 1, 1)

	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 5);

const AbyssalDemonTable = new LootTable()
	.every('Abyssal ashes')
	.every(AbyssalDemonPreTable)

	/* Tertiary */
	.tertiary(25, 'Ensouled abyssal head')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(1200, 'Clue scroll (elite)')
	.tertiary(6000, 'Abyssal head');

const AbyssalDemonWildyCaveTable = new LootTable()
	.every(AbyssalDemonTable)
	.add(WildySlayerCaveTable, 1, 80)
	.add(new LootTable(), 1, 20);

export default new SimpleMonster({
	id: 415,
	name: 'Abyssal Demon',
	table: AbyssalDemonTable,
	wildyCaveTable: AbyssalDemonWildyCaveTable,
	aliases: ['abbys', 'abby demon', 'abby demons', 'abyssal demons', 'abyssal demon']
});
