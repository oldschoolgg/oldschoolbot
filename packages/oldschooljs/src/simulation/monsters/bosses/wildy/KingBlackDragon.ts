import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const KingBlackDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Black dragonhide', 2)
	.tertiary(450, 'Clue scroll (elite)')
	.tertiary(129, 'Kbd heads')
	.tertiary(3000, 'Prince black dragon')
	.tertiary(5000, 'Draconic visage')
	.oneIn(1000, 'Dragon pickaxe')

	/* Weapons and armour */
	.add('Rune longsword', 1, 10)
	.add('Adamant platebody', 1, 9)
	.add('Adamant kiteshield', 1, 3)
	.add('Dragon med helm', 1, 1)

	/* Runes and ammunition */
	.add('Air rune', 300, 10)
	.add('Iron arrow', 690, 10)
	.add('Runite bolts', [10, 20], 10)
	.add('Fire rune', 300, 5)
	.add('Law rune', 30, 5)
	.add('Blood rune', 30, 5)

	/* Resources */
	.add('Yew logs', 150, 10)
	.add('Adamantite bar', 3, 5)
	.add('Runite bar', 1, 3)
	.add('Gold ore', 100, 2)

	/* Other */
	.add('Amulet of power', 1, 7)
	.add('Dragon arrowtips', [5, 14], 5)
	.add('Dragon dart tip', [5, 14], 5)
	.add('Dragon javelin heads', 15, 5)
	.add('Runite limbs', 1, 4)
	.add('Shark', 4, 4)

	.add(RareDropTable, 1, 8)
	.add(GemTable, 1, 2);

export default new SimpleMonster({
	id: 6502,
	name: 'King Black Dragon',
	table: KingBlackDragonTable,
	aliases: ['kbd', 'king black dragon']
});
