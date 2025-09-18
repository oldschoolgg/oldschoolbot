import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';
import HerbDropTable from '@/simulation/subtables/HerbDropTable.js';
import { GemTable } from '@/simulation/subtables/RareDropTable.js';

export const ArmouredZombieTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Runes and ammunition */
	.add('Pure essence', [20, 50], 11)
	.add('Rune arrow', 12, 8)
	.add('Blood rune', [6, 14], 4)
	.add('Cosmic rune', [15, 30], 3)
	.add('Nature rune', [6, 16], 2)
	.add('Death rune', [6, 14], 1)
	.add('Chaos rune', [15, 30], 1)

	/* Herbs */
	.add(HerbDropTable, 1, 45)

	/* Other */
	.add('Coins', [200, 600], 30)
	.add('Oak plank', 6, 6)
	.add('Plank', 12, 5)
	.add('Coins', [20, 30], 3)
	.add('Rune mace', 1, 3)
	.add('Teak plank', 3, 2)
	.add('Eye of newt', [4, 8], 1)
	.add('Rune kiteshield', 1, 1)
	.add('Fishing bait', 6, 1)

	/* Gem drop table */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(600, 'Broken zombie axe')
	.tertiary(600, 'Broken zombie helmet')
	.tertiary(5000, 'Zombie champion scroll');

export default new SimpleMonster({
	id: 12_720,
	name: 'Armoured Zombie',
	table: ArmouredZombieTable,
	aliases: ['armoured zombie']
});
