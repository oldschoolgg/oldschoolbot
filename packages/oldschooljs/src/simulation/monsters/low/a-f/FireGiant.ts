import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const FireGiantTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Steel axe', 1, 3)
	.add('Mithril sq shield', 1, 2)
	.add('Fire battlestaff', 1, 1)
	.add('Rune scimitar', 1, 1)

	/* Runes and ammunition */
	.add('Fire rune', 150, 10)
	.add('Chaos rune', 5, 7)
	.add('Rune arrow', 12, 5)
	.add('Blood rune', 5, 4)
	.add('Fire rune', 37, 1)
	.add('Law rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 19)

	/* Coins */
	.add('Coins', 60, 40)
	.add('Coins', 15, 7)
	.add('Coins', 25, 6)
	.add('Coins', 300, 2)
	.add('Coins', 50, 1)

	/* Other */
	.add('Lobster', 1, 3)
	.add('Steel bar', 1, 2)
	.add('Strength potion(2)', 1, 1)

	/* RDT */
	.add(RareDropTable, 1, 1)
	.add(GemTable, 1, 11)

	/* Tertiary */
	.tertiary(20, 'Ensouled giant head')
	.tertiary(400, 'Long bone')
	.tertiary(5000, 'Giant champion scroll')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 2075,
	name: 'Fire Giant',
	table: FireGiantTable,
	aliases: ['fire giant', 'fire g', 'fires']
});
