import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const DwarfTable = new LootTable({ limit: 128 })
	.every('Bones')
	.tertiary(100, 'Clue scroll (beginner)')

	/* Weapons and Armour*/
	.add('Bronze pickaxe', 1, 13)
	.add('Bronze med helm', 1, 4)
	.add('Bronze battleaxe', 1, 2)
	.add('Iron battleaxe')

	/* Runes and ammunition */
	.add('Bronze bolts', [2, 12], 7)
	.add('Chaos rune', 2, 4)
	.add('Nature rune', 2, 4)

	/* Coins */
	.add('Coins', 4, 20)
	.add('Coins', 10, 15)
	.add('Coins', 30, 2)

	/* Other */
	.add('Hammer', 1, 10)
	.add('Bronze bar', 1, 7)
	.add('Iron ore', 1, 4)
	.add('Tin ore', 1, 3)
	.add('Copper ore', 1, 3)
	.add('Iron bar', 1, 3)
	.add('Coal', 1, 2)

	.add(GemTable);

export default new SimpleMonster({
	id: 290,
	name: 'Dwarf',
	table: DwarfTable,
	aliases: ['dwarf']
});
