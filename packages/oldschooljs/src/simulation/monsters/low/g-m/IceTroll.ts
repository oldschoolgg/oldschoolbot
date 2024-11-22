import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

const IceTrollTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Adamant full helm', 1, 10)
	.add('Steel platebody', 1, 10)
	.add('Mithril warhammer', 1, 5)
	.add('Adamant axe', 1, 5)
	.add('Rune kiteshield', 1, 2)
	.add('Granite shield', 1, 1)
	.add('Rune warhammer', 1, 1)

	/* Runes */
	.add('Earth rune', [8, 14], 10)
	.add('Earth rune', [12, 36], 10)
	.add('Nature rune', [4, 12], 5)
	.add('Law rune', [4, 8], 5)

	/* Herbs */
	.add(HerbDropTable, 1, 2)
	.add(UncommonSeedDropTable, 1, 11)

	/* Other */
	.add('Coins', 200, 20)
	.add('Raw shark', [2, 8], 10)
	.add('Seaweed', [3, 9], 10)
	.add('Ball of wool', [18, 42], 10)

	/* Gem drop table */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(20, 'Ensouled troll head')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 648,
	name: 'Ice Troll',
	table: IceTrollTable,
	aliases: ['ice troll']
});
