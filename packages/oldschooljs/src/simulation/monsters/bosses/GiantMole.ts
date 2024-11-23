import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../subtables/RareDropTable';

const GiantMoleTable = new LootTable()
	.every('Big bones')
	.every('Mole claw', 1)
	.every('Mole skin', [1, 3])
	.tertiary(400, 'Long bone')
	.tertiary(500, 'Clue scroll (elite)')
	.tertiary(3000, 'Baby mole')
	.tertiary(5013, 'Curved bone')

	/* Weapons and armour */
	.add('Adamant longsword', 1, 10)
	.add('Mithril platebody', 1, 9)
	.add('Amulet of strength', 1, 7)
	.add('Mithril axe', 1, 2)
	.add('Mithril battleaxe')
	.add('Rune med helm')

	/* Runes and ammunition */
	.add('Air rune', 105, 20)
	.add('Blood rune', 15, 19)
	.add('Fire rune', 105, 11)
	.add('Death rune', 7, 3)
	.add('Law rune', 15, 5)
	.add('Iron arrow', 690, 10)

	/* Other */
	.add('Yew logs', 100, 10)
	.add('Shark', 4, 4)
	.add('Mithril bar', 1, 3)
	.add('Iron ore', 100, 2)
	.add('Oyster pearls')

	/* Subtables */
	.add(RareDropTable, 1, 4)
	.add(GemTable, 1, 5);

export default new SimpleMonster({
	id: 5779,
	name: 'Giant Mole',
	table: GiantMoleTable,
	aliases: ['mole', 'giant mole']
});
