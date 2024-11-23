import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const TerrorDogTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Steel platelegs', 1, 4)
	.add('Mithril axe', 1, 3)
	.add('Steel battleaxe', 1, 3)
	.add('Mithril spear', 1, 2)
	.add('Adamant full helm', 1, 1)
	.add('Granite helm', 1, 1)
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

	/* Gem drop table */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 6473,
	name: 'Terror dog',
	table: TerrorDogTable,
	aliases: ['terror dog']
});
