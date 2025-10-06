import { HerbDropTable } from '@/simulation/subtables/HerbDropTable.js';
import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import RareSeedTable from '@/simulation/subtables/RareSeedTable.js';
import VariableAllotmentSeedTable from '@/simulation/subtables/VariableAllotmentSeedTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const CaveHorrorPreTable = new LootTable()
	/* Weapons and armor*/
	.add('Mithril axe', 1, 3)
	.add('Rune dagger', 1, 1)
	.add('Adamant full helm', 1, 1)
	.add('Mithril kiteshield', 1, 1)
	.oneIn(512, 'Black mask (10)')

	/* Runes */
	.add('Nature rune', 6, 6)
	.add('Nature rune', 4, 5)
	.add('Nature rune', 3, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 13)

	/* Seeds */
	.add(RareSeedTable, 1, 18)
	.add(VariableAllotmentSeedTable, 1, 15)

	/* Coins */
	.add('Coins', 44, 28)
	.add('Coins', 132, 12)
	.add('Coins', 440, 1)

	/* Other */
	.add('Limpwurt root', 1, 7)
	.add('Teak logs', 4, 7)
	.add('Mahogany logs', 2, 3)

	/* Gems */
	.add(GemTable, 1, 5);

const CaveHorrorTable = new LootTable()
	.every('Big bones')
	.every(CaveHorrorPreTable)

	/* Tertiary */
	.tertiary(30, 'Ensouled horror head')
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 1047,
	name: 'Cave Horror',
	table: CaveHorrorTable,
	aliases: ['cave horror', 'cave h']
});
