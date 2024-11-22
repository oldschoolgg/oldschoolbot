import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const ChaosDwarfTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Weapons and Armour*/
	.add('Steel full helm', 1, 2)
	.add('Mithril longsword', 1, 1)
	.add('Mithril sq shield', 1, 1)

	/* Runes */
	.add('Law rune', 3, 4)
	.add('Air rune', 24, 3)
	.add('Chaos rune', 10, 3)
	.add('Mind rune', 37, 3)
	.add('Nature rune', 9, 3)
	.add('Cosmic rune', 3, 2)
	.add('Death rune', 3, 1)
	.add('Water rune', 10, 1)

	/* Coins */
	.add('Coins', 92, 40)
	.add('Coins', 47, 18)
	.add('Coins', 25, 11)
	.add('Coins', 150, 10)
	.add('Coins', 350, 2)
	.add('Coins', 15, 2)

	/* Other */
	.add('Muddy key', 1, 7)
	.add('Mithril bar', 1, 6)
	.add('Coal', 1, 1)
	.add('Cheese', 1, 1)
	.add('Tomato', 1, 1)

	/* Subtable */
	.add(GemTable, 1, 5);

export default new SimpleMonster({
	id: 291,
	name: 'Chaos dwarf',
	table: ChaosDwarfTable,
	aliases: ['chaos dwarf']
});
