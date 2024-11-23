import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import CommonSeedDropTable from '../../../subtables/CommonSeedDropTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const MountainTrollTable = new LootTable({ limit: 128 })
	.every('Big bones')

	/* Weapons and armour */
	.add('Steel med helm', 1, 4)
	.add('Black warhammer', 1, 3)
	.add('Steel warhammer', 1, 3)
	.add('Adamant med helm', 1, 1)
	.add('Adamant warhammer', 1, 1)
	.add('Mithril sq shield', 1, 1)

	/* Runes */
	.add('Earth rune', 60, 8)
	.add('Nature rune', 7, 5)
	.add('Law rune', 2, 3)
	.add('Earth rune', 45, 1)
	.add('Earth rune', 25, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Seeds */
	.add(CommonSeedDropTable, 1, 19)

	/* Other */
	.add('Coins', 35, 29)
	.add('Coins', 100, 10)
	.add('Coins', 8, 7)
	.add('Coins', 50, 6)
	.add('Coins', 250, 1)

	/* Other */
	.add('Coal', 3, 3)
	.add('Raw mackerel', 3, 2)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(45, 'Ensouled troll head')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 936,
	name: 'Mountain Troll',
	table: MountainTrollTable,
	aliases: ['mountain troll', 'troll', 'trolls']
});
