import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const BrutalBlueDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Blue dragonhide', 2)

	/* Weapons and armour */
	.add('Adamant hasta', 1, 10)
	.add('Adamant platelegs', 1, 7)
	.add('Mithril full helm', 1, 5)
	.add('Rune longsword', 1, 5)
	.add("Blue d'hide body", 1, 2)
	.add("Blue d'hide vambraces", 1, 1)
	.add('Dragon dagger', 1, 1)
	.add('Dragon longsword', 1, 1)
	.add('Dragon med helm', 1, 1)
	.add('Rune full helm', 1, 1)
	.add('Rune platebody', 1, 1)

	/* Runes and ammunition */
	.add('Chaos rune', 18, 8)
	.add('Death rune', 11, 8)
	.add('Rune javelin', 20, 8)
	.add('Air rune', 50, 7)
	.add('Law rune', 15, 7)
	.add('Rune arrow', 15, 7)
	.add('Adamant dart', 10, 5)
	.add('Rune knife', 5, 2)
	.add('Rune thrownaxe', 10, 2)

	/* Materials */
	.add('Blue dragon scale', 5, 4)
	.add('Dragon dart tip', 5, 3)
	.add('Dragon arrowtips', 5, 2)
	.add('Runite ore', 1, 2)
	.add('Dragon javelin heads', 12, 1)

	/* Other */
	.add('Coins', 370, 11)
	.add('Curry', 2, 8)
	.add('Coins', 621, 1)

	/* Other */
	.add('Adamantite ore', 1, 3)
	.add('Bass', 1, 3)

	/* Rare and Gem drop table, slightly adjusted */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(20, 'Ensouled dragon head')
	.tertiary(33, 'Scaly blue dragonhide')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(750, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 7273,
	name: 'Brutal blue Dragon',
	table: BrutalBlueDragonTable,
	aliases: ['brutal blue dragon', 'brutal blues', 'brutal blue']
});
