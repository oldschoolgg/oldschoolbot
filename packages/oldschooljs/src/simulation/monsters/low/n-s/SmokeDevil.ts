import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const SmokeDevilHerbTable = new LootTable().add(HerbDropTable, 1, 2).add(HerbDropTable, 2, 1);

export const SmokeDevilPreTable = new LootTable({ limit: 128 })
	/* Weapons and armor */
	.add('Adamant battleaxe', 1, 3)
	.add('Rune dagger', 1, 3)
	.add('Air battlestaff', 1, 3)
	.add("Black d'hide vambraces", 1, 3)
	.add('Fire battlestaff', 1, 3)
	.add('Mithril plateskirt', 1, 2)
	.add('Rune full helm', 1, 2)
	.add('Rune chainbody', 1, 2)
	.add("Red d'hide body", 1, 1)
	.oneIn(512, 'Occult necklace')
	.oneIn(32_768, 'Dragon chainbody')

	/* Runes and ammunition */
	.add('Smoke rune', 15, 11)
	.add('Smoke rune', 40, 5)
	.add('Runite bolts', 15, 5)
	.add('Fire rune', 37, 4)
	.add('Air rune', 37, 4)
	.add('Soul rune', 10, 4)
	.add('Fire rune', 150, 2)
	.add('Rune arrow', 24, 2)

	/* Herbs */
	.add(SmokeDevilHerbTable, 1, 18)

	/* Coins */
	.add('Coins', 750, 12)
	.add('Coins', 80, 7)
	.add('Coins', 300, 3)

	/* Other */
	.add('Shark', 1, 6)
	.add('Steel bar', 2, 3)
	.add('Magic logs', 5, 3)
	.add('Coal', 15, 3)
	.add('Adamantite bar', 1, 2)
	.add('Crossbow string', 1, 2)
	.add('Ugthanki kebab', 3, 2)

	/* RDT */
	.add(RareDropTable, 1, 4)
	.add(GemTable, 1, 4);

const SmokeDevilTable = new LootTable()
	.every('Ashes')
	.every(SmokeDevilPreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(750, 'Clue scroll (elite)');

export default new SimpleMonster({
	id: 498,
	name: 'Smoke Devil',
	table: SmokeDevilTable,
	aliases: ['smoke devil', 'smokeys', 'smokies', 'smoke devils']
});
