import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const SkeletonMageTable = new LootTable()
	.every('Ashes')

	/* Weapons and armour */
	.add('Pink skirt', 1, 2)

	/* Runes */
	.add('Mind rune', [7, 9], 12)
	.add('Law rune', [2, 3], 12)
	.add('Nature rune', [1, 3], 11)
	.add('Chaos rune', [3, 4], 10)

	/* Herbs */
	.add(HerbDropTable, 1, 12)

	/* Materials */
	.add('Uncut opal', 1, 10)
	.add('Pot of flour', 1, 10)
	.add('Iron bar', [1, 2], 5)

	/* Other */
	.add('Coins', [25, 54], 33)
	.add('Big bones', [2, 4], 6)

	/* Gem drop table */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)')
	.tertiary(5000, 'Skeleton champion scroll');

export default new SimpleMonster({
	id: 4319,
	name: 'Skeleton Mage',
	table: SkeletonMageTable,
	aliases: ['skeleton mage']
});
