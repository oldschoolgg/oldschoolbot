import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const RedDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Red dragonhide')

	/* Weapons and armour */
	.add('Mithril 2h sword', 1, 4)
	.add('Mithril axe', 1, 3)
	.add('Mithril battleaxe', 1, 3)
	.add('Rune dart', 8, 3)
	.add('Mithril javelin', 20, 1)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant platebody', 1, 1)
	.add('Rune longsword', 1, 1)

	/* Runes and ammunition */
	.add('Rune arrow', 4, 8)
	.add('Law rune', 4, 5)
	.add('Blood rune', 2, 4)
	.add('Death rune', 5, 3)

	/* Herbs */
	.add(HerbDropTable, 1, 2)

	/* Coins */
	.add('Coins', 196, 40)
	.add('Coins', 66, 29)
	.add('Coins', 330, 10)
	.add('Coins', 690, 1)

	/* Other */
	.add('Dragon javelin heads', 10, 10)
	.add('Chocolate cake', 3, 3)
	.add('Adamantite bar', 1, 1)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(40, 'Ensouled dragon head')
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 247,
	name: 'Red Dragon',
	table: RedDragonTable,
	aliases: ['red dragon', 'red drags']
});
