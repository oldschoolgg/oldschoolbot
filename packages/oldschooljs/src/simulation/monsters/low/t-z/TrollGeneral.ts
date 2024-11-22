import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const TrollGeneralTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Steel platebody', 1, 4)
	.add('Black warhammer', 1, 3)
	.add('Steel warhammer', 1, 3)
	.add('Adamant axe', 1, 2)
	.add('Adamant sq shield', 1, 1)
	.add('Granite shield', 1, 1)
	.add('Mithril platebody', 1, 1)
	.add('Rune warhammer', 1, 1)

	/* Runes */
	.add('Earth rune', 80, 8)
	.add('Nature rune', 16, 5)
	.add('Law rune', 4, 3)
	.add('Earth rune', 65, 1)
	.add('Earth rune', 25, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Coins */
	.add('Coins', 40, 29)
	.add('Coins', 135, 25)
	.add('Coins', 190, 10)
	.add('Coins', 20, 4)
	.add('Coins', 420, 1)

	/* Other */
	.add('Coal', 6, 3)
	.add('Raw tuna', 4, 2)

	/* Gem drop table */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(28, 'Ensouled troll head')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 4120,
	name: 'Troll general',
	table: TrollGeneralTable,
	aliases: ['troll general']
});
