import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const ArmouredZombieTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Runes and ammunition */
	.add('Pure essence', [20, 50], 12)
	.add('Adamant arrow', 12, 8)
	.add('Blood rune', [4, 10], 4)
	.add('Cosmic rune', [10, 20], 3)
	.add('Nature rune', [4, 10], 2)
	.add('Chaos rune', [10, 20], 1)
	.add('Death rune', [4, 10], 1)

	/* Herbs */
	.add(HerbDropTable, 1, 43)

	/* Other */
	.add('Coins', [50, 400], 31)
	.add('Oak plank', 5, 6)
	.add('Plank', 10, 5)
	.add('Adamant mace', 1, 3)
	.add('Coins', [10, 20], 3)
	.add('Teak plank', 2, 2)
	.add('Adamant kiteshield', 1, 1)
	.add('Eye of newt', [2, 6], 1)
	.add('Fishing bait', 6, 1)

	/* Gem drop table */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(800, 'Broken zombie axe')
	.tertiary(5000, 'Zombie champion scroll');

export default new SimpleMonster({
	id: 12_720,
	name: 'Armoured Zombie',
	table: ArmouredZombieTable,
	aliases: ['armoured zombie']
});
