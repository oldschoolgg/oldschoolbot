import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import CommonSeedDropTable from '../../../subtables/CommonSeedDropTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const JogreTable = new LootTable({ limit: 129 })
	.tertiary(5000, 'Jogre champion scroll')
	.tertiary(129, 'Clue scroll (medium)')
	.every('Jogre bones')

	// Weapons
	.add('Bronze spear', 1, 30)
	.add('Iron spear', 1, 4)

	// Runes/ammunition
	.add('Nature rune', 2, 10)
	.add('Nature rune', 10, 2)
	.add('Nature rune', 5, 2)
	.add('Steel javelin', 5, 2)

	.add(HerbDropTable, 1, 6)
	.add(CommonSeedDropTable, 1, 15)
	.add(GemTable, 1, 1)

	// Others
	.add('Trading sticks', 22, 27)
	.add('Pineapple', 2, 8)
	.add('Knife', 1, 5)
	.add('Bones', 1, 3)
	.add('Big bones', 1, 3)
	.add('Big bones', 3, 2)
	.add('Bones', 1, 2);

export default new SimpleMonster({
	id: 2094,
	name: 'Jogre',
	table: JogreTable,
	aliases: ['jogre']
});
