import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const SkeletonTable = new LootTable({ limit: 128 })
	.every('Bones')
	.tertiary(5000, 'Skeleton champion scroll')
	.tertiary(100, 'Clue scroll (beginner)')

	/* Runes/Ammunition */
	.add('Bronze arrow', 2, 7)
	.add('Bronze arrow', 5, 4)
	.add('Iron arrow', 1, 4)
	.add('Air rune', 12, 2)
	.add('Earth rune', 3, 2)
	.add('Fire rune', 2, 2)
	.add('Chaos rune', 3, 2)
	.add('Nature rune', 3, 1)
	.add('Steel arrow', 1, 1)

	.add(HerbDropTable, 1, 21)

	/* Other */
	.add('Coins', 2, 18)
	.add('Coins', 12, 15)
	.add('Coins', 4, 7)
	.add('Coins', 16, 4)
	.add('Coins', 25, 4)
	.add('Coins', 33, 4)
	.add('Coins', 48, 1)
	.add('Iron dagger', 1, 6)
	.add('Fire talisman', 1, 2)
	.add('Grain', 1, 1)
	.add('Iron ore', 1, 1)

	.add(GemTable);

export default new SimpleMonster({
	id: 70,
	name: 'Skeleton',
	table: SkeletonTable,
	aliases: ['skeleton']
});
