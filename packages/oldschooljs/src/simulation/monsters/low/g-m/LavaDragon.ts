import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

export const LavaDragonTable = new LootTable()
	.every('Lava dragon bones')
	.every('Black dragonhide')
	.every('Lava scale')

	/* Weapons and armour */
	.add('Rune dart', 12, 6)
	.add('Rune knife', 8, 4)
	.add('Lava battlestaff', 1, 3)
	.add('Adamant 2h sword', 1, 2)
	.add('Adamant platebody', 1, 2)
	.add('Rune axe', 1, 2)
	.add('Rune kiteshield', 1, 2)
	.add('Rune longsword', 1, 2)
	.add('Rune med helm', 1, 1)
	.add('Rune full helm', 1, 1)

	/* Runes and ammunition */
	.add('Rune javelin', 20, 10)
	.add('Fire rune', 75, 7)
	.add('Blood rune', 20, 7)
	.add('Runite bolts', 30, 6)
	.add('Death rune', 20, 5)
	.add('Law rune', 20, 5)
	.add('Lava rune', 15, 4)
	.add('Lava rune', 30, 4)

	/* Herbs */
	.add(HerbDropTable, 2, 5)

	/* Coins */
	.add('Coins', 66, 15)
	.add('Coins', 690, 1)

	/* Other */
	.add('Dragon javelin heads', 15, 7)
	.add('Fire orb', 15, 5)
	.add('Adamantite bar', 2, 5)
	.add('Onyx bolt tips', 12, 5)
	.add('Chocolate cake', 3, 3)
	.add('Fire talisman', 1, 1)

	/* Gem drop table */
	.add(RareDropTable, 1, 3)
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(18, 'Ensouled dragon head')
	.tertiary(250, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 6593,
	name: 'Lava dragon',
	table: LavaDragonTable,
	aliases: ['lava dragon']
});
