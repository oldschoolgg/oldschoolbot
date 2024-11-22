import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const UniqueTable = new LootTable()
	.add('Dragon platelegs')
	.add('Dragon plateskirt')
	.add('Dragon spear')
	.add('Uncut dragonstone');

const BrutalBlackDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Black dragonhide', 2)

	/* Unique */
	.add(UniqueTable, 1, 1)

	/* Weapons and armour */
	.add('Rune hasta', 1, 10)
	.add('Rune platelegs', 1, 7)
	.add('Rune full helm', 2, 6)
	.add('Rune dart', 20, 5)
	.add('Rune longsword', 1, 5)
	.add("Black d'hide body", 1, 2)
	.add('Rune knife', 25, 2)
	.add('Rune thrownaxe', 30, 2)
	.add("Black d'hide vambraces", 1, 1)
	.add('Rune platebody', 1, 1)
	.add('Dragon med helm', 1, 1)
	.add('Dragon longsword', 1, 1)
	.add('Dragon dagger', 1, 1)

	/* Runes and ammunition */
	.add('Rune javelin', 50, 8)
	.add('Blood rune', 50, 8)
	.add('Soul rune', 50, 8)
	.add('Death rune', 75, 7)
	.add('Law rune', 75, 7)
	.add('Rune arrow', 75, 7)

	/* Materials */
	.add('Lava scale', 5, 4)
	.add('Dragon dart tip', 40, 3)
	.add('Runite ore', 3, 2)
	.add('Dragon arrowtips', 40, 2)
	.add('Dragon javelin heads', 40, 1)

	/* Coins */
	.add('Coins', 370, 11)
	.add('Coins', 2200, 2)
	.add('Coins', [540, 929], 1)

	/* Other */
	.add('Anglerfish', 2, 8)

	/* Rare and Gem drop table */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(20, 'Ensouled dragon head')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(250, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 7275,
	name: 'Brutal black Dragon',
	table: BrutalBlackDragonTable,
	aliases: ['brutal black dragon', 'bbds', 'bbd', 'brutal blacks', 'brutal black']
});
