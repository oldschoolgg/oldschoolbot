import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const BlackKnightTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Weapons and armour */
	.add('Iron sword', 1, 4)
	.add('Iron full helm', 1, 2)
	.add('Steel mace', 1, 1)

	/* Runes */
	.add('Mithril arrow', 3, 4)
	.add('Body rune', 9, 3)
	.add('Chaos rune', 6, 3)
	.add('Earth rune', 10, 3)
	.add('Death rune', 2, 2)
	.add('Law rune', 3, 2)
	.add('Cosmic rune', 7, 1)
	.add('Mind rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 3)

	/* Materials */
	.add('Steel bar', 1, 6)
	.add('Tin ore', 1, 1)
	.add('Steel bar', 1, 1)

	/* Coins */
	.add('Coins', 35, 21)
	.add('Coins', 6, 11)
	.add('Coins', 58, 10)
	.add('Coins', 12, 9)
	.add('Coins', 80, 2)
	.add('Coins', 1, 1)
	.add('Coins', 13, 1)

	/* Other */
	.add('Bread', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 3);

export default new SimpleMonster({
	id: 516,
	name: 'Black Knight',
	table: BlackKnightTable,
	aliases: ['black knight']
});
