import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const SteelDragonTable = new LootTable({ limit: 128 })
	.every('Dragon bones')
	.every('Steel bar', 5)

	/* Weapons and armour */
	.add('Rune dart(p)', 12, 7)
	.add('Rune mace', 1, 4)
	.add('Rune knife', 7, 3)
	.add('Adamant kiteshield', 1, 2)
	.add('Rune axe', 1, 2)
	.add('Rune full helm', 1, 1)
	.oneIn(512, 'Dragon plateskirt')
	.oneIn(512, 'Dragon platelegs')

	/* Runes and ammunition */
	.add('Rune javelin', 7, 20)
	.add('Blood rune', 20, 19)
	.add('Runite bolts', [2, 12], 6)
	.add('Soul rune', 5, 5)

	/* Coins */
	.add('Coins', 470, 17)

	/* Other */
	.add('Super attack(3)', 1, 13)
	.add('Runite limbs', 1, 8)
	.add('Dragon javelin heads', 12, 5)
	.add('Runite bar', 1, 3)
	.add('Super defence(2)', 1, 3)
	.add('Curry', 1, 1)
	.add('Curry', 2, 1)

	/* RDT */
	.add(RareDropTable, 1, 4)
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(64, 'Clue scroll (hard)')
	.tertiary(500, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 8086,
	name: 'Steel Dragon',
	table: SteelDragonTable,
	aliases: ['steel dragon']
});
