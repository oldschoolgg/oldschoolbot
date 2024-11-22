import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../../util';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import VariableAllotmentSeedTable from '../../../subtables/VariableAllotmentSeedTable';

const JungleHorrorTable = new LootTable({ limit: 129 })
	.every('Bones')

	/* Weapons and armor*/
	.add('Iron warhammer', 1, 17)
	.add('Iron kiteshield', 1, 5)
	.add('Iron spear', 1, 4)
	.add('Iron javelin', 5, 2)

	/* Runes */
	.add('Nature rune', 4, 10)
	.add('Nature rune', 2, 7)
	.add('Death rune', 1, 5)

	/* Herbs */
	.add(HerbDropTable, 1, 6)

	/* Seeds */
	.add(VariableAllotmentSeedTable, 1, 15)

	/* Materials */
	.add('Iron ore', 1, 27)
	.add('Teak logs', 3, 9)
	.add('Mahogany logs', 1, 3)

	/* Other */
	.add('Pineapple', 1, 8)
	.add(
		itemTupleToTable([
			['Big bones', 1],
			['Bones', 1]
		]),
		1,
		3
	)
	.add(
		itemTupleToTable([
			['Big bones', 3],
			['Bones', 1]
		]),
		1,
		2
	)

	/* Gems */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(40, 'Ensouled horror head')
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 1042,
	name: 'Jungle horror',
	table: JungleHorrorTable,
	aliases: ['jungle horror', 'jungle h']
});
