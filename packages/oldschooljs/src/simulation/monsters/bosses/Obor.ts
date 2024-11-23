import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../util';

const OborTable = new LootTable({ limit: 118 })
	.every('Big bones')
	.every('Clue scroll (beginner)')
	.every('Ensouled giant head')
	.tertiary(16, 'Giant key')
	.tertiary(400, 'Long bone')
	.tertiary(5000, 'Giant champion scroll')
	.tertiary(5013, 'Curved bone')

	/* Weapons and armour */
	.add('Rune med helm', 1, 6)
	.add('Rune full helm', 1, 5)
	.add('Rune longsword', 1, 5)
	.add('Rune battleaxe', 1, 4)
	.add('Rune kiteshield', 1, 3)
	.add('Rune chainbody', 1, 3)
	.add('Rune platelegs', 1, 3)
	.add('Rune plateskirt', 1, 3)
	.add('Rune 2h sword', 1, 3)
	.add('Hill giant club', 1, 1)

	/* Runes */
	.add('Law rune', [50, 99], 12)
	.add('Cosmic rune', [60, 119], 12)
	.add('Chaos rune', [100, 199], 10)
	.add('Death rune', [40, 79], 10)
	.add('Nature rune', [40, 79], 7)

	/* Other */
	.add('Coins', [10_000, 20_000], 10)
	.add('Limpwurt root', 20, 8)
	.add('Big bones', 50, 8)
	.add(
		itemTupleToTable([
			['Uncut diamond', 5],
			['Uncut ruby', 5]
		]),
		1,
		5
	);

export default new SimpleMonster({
	id: 7416,
	name: 'Obor',
	table: OborTable,
	aliases: ['obor']
});
