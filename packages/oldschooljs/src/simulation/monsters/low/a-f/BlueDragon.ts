import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const BlueDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Blue dragonhide')

	/* Weapons and armour */
	.add('Steel platelegs', 1, 4)
	.add('Mithril axe', 1, 3)
	.add('Steel battleaxe', 1, 3)
	.add('Mithril spear', 1, 2)
	.add('Adamant full helm', 1, 1)
	.add('Mithril kiteshield', 1, 1)
	.add('Rune dagger', 1, 1)

	/* Runes*/
	.add('Water rune', 75, 8)
	.add('Nature rune', 15, 5)
	.add('Law rune', 3, 3)
	.add('Fire rune', 37, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Coins */
	.add('Coins', 44, 29)
	.add('Coins', 132, 25)
	.add('Coins', 200, 10)
	.add('Coins', 11, 5)
	.add('Coins', 440, 1)

	/* Other */
	.add('Adamantite ore', 1, 3)
	.add('Bass', 1, 3)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(50, 'Ensouled dragon head')
	.tertiary(50, 'Scaly blue dragonhide')
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 265,
	name: 'Blue Dragon',
	table: BlueDragonTable,
	aliases: ['blue dragon', 'blue drags']
});
