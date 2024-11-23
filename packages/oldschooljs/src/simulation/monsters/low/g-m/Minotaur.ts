import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const MinotaurTable = new LootTable({ limit: 101 })
	.every('Bones')

	.oneIn(33, 'Right skull half')

	.tertiary(50, 'Ensouled minotaur head')
	.tertiary(60, 'Clue scroll (beginner)')
	.tertiary(101, 'Clue scroll (easy)')

	/* Weapons and armour */
	.add('Iron arrow', [5, 14], 10)
	.add('Bronze spear', 1, 10)
	.add('Bronze full helm', 1, 10)
	.add('Bronze dagger', 1, 4)
	.add('Bronze arrow', 3, 3)

	/* Runes */
	.add('Mind rune', 1, 1)

	/* Other */
	.add('Coins', 7, 20)
	.add('Coins', 2, 11)
	.add('Coins', [5, 84], 7)
	.add('Tin ore', 1, 6)
	.add('Copper ore', 1, 6)
	.add('Cooked meat', 1, 3)
	.add('Pure essence', 15, 5)

	/* Subtables */
	.add(GemTable, 1, 1);

export default new SimpleMonster({
	id: 2481,
	name: 'Minotaur',
	table: MinotaurTable,
	aliases: ['minotaur']
});
