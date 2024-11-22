import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

const MossGiantTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Black sq shield', 1, 5)
	.add('Magic staff', 1, 2)
	.add('Steel med helm', 1, 2)
	.add('Mithril sword', 1, 2)
	.add('Mithril spear', 1, 2)
	.add('Steel kiteshield', 1, 1)

	/* Runes and ammunition */
	.add('Law rune', 3, 4)
	.add('Air rune', 18, 3)
	.add('Earth rune', 27, 3)
	.add('Chaos rune', 7, 3)
	.add('Nature rune', 6, 3)
	.add('Cosmic rune', 3, 2)
	.add('Iron arrow', 15, 2)
	.add('Steel arrow', 30, 1)
	.add('Death rune', 3, 1)
	.add('Blood rune', 1, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 5)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 35)

	/* Coins */
	.add('Coins', 37, 19)
	.add('Coins', 2, 8)
	.add('Coins', 119, 10)
	.add('Coins', 300, 2)

	/* Other */
	.add('Steel bar', 1, 6)
	.add('Coal', 1, 1)
	.add('Spinach roll', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(24, 'Ensouled giant head')
	.tertiary(45, 'Clue scroll (beginner)')
	.tertiary(150, 'Mossy key')
	.tertiary(400, 'Long bone')
	.tertiary(5000, 'Giant champion scroll')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 2090,
	name: 'Moss giant',
	table: MossGiantTable,
	aliases: ['moss giant']
});
