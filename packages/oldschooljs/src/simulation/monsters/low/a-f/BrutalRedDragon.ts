import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const BrutalRedDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Red dragonhide', 2)

	/* Weapons and armour */
	.add('Rune hasta', 1, 10)
	.add('Adamant platelegs', 1, 7)
	.add('Adamant full helm', 1, 5)
	.add('Rune longsword', 1, 5)
	.add("Red d'hide body", 1, 2)
	.add('Rune full helm', 2, 2)
	.add("Red d'hide vambraces", 1, 1)
	.add('Dragon dagger', 1, 1)
	.add('Dragon longsword', 1, 1)
	.add('Dragon med helm', 1, 1)
	.add('Rune platebody', 1, 1)

	/* Runes and ammunition */
	.add('Death rune', 25, 8)
	.add('Rune javelin', 30, 8)
	.add('Air rune', 105, 7)
	.add('Blood rune', 12, 7)
	.add('Law rune', 25, 7)
	.add('Rune arrow', 25, 7)
	.add('Adamant dart', 20, 5)
	.add('Rune knife', 10, 2)
	.add('Rune thrownaxe', 15, 2)

	/* Materials */
	.add('White berries', 5, 4)
	.add('Dragon dart tip', 8, 3)
	.add('Dragon arrowtips', 8, 2)
	.add('Runite ore', 2, 2)
	.add('Dragon javelin heads', 25, 1)

	/* Coins */
	.add('Coins', 670, 11)
	.add('Coins', 621, 1)

	/* Other */
	.add('Curry', 3, 8)

	/* Rare and Gem drop table */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(20, 'Ensouled dragon head')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(500, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 7274,
	name: 'Brutal red Dragon',
	table: BrutalRedDragonTable,
	aliases: ['brutal red dragon', 'brutal reds', 'brutal red']
});
