import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { UncommonSeedDropTable } from '../../../subtables';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const TatteredPageTable = new LootTable()
	.add('Tattered moon page')
	.add('Tattered sun page')
	.add('Tattered temple page');

const HerbHerbDropTable = new LootTable().add(HerbDropTable, 1, 1).add(HerbDropTable, 2, 1).add(HerbDropTable, 3, 1);

export const UndeadDruidTable = new LootTable()
	.every('Bones')

	/* Tertiary */
	.tertiary(30, TatteredPageTable)
	.tertiary(75, 'Grubby key')
	.tertiary(100, 'Clue scroll (hard)')
	.tertiary(5000, 'Zombie champion scroll')

	/* Weapons and armour */
	.add('Air battlestaff', 1, 2)
	.add('Earth battlestaff', 1, 2)
	.oneIn(1000, 'Mask of ranul')

	/* Runes */
	.add('Air rune', [200, 300], 5)
	.add('Earth rune', [200, 300], 5)
	.add('Blood rune', [20, 30], 3)
	.add('Chaos rune', [50, 80], 3)
	.add('Cosmic rune', [20, 30], 3)
	.add('Death rune', [20, 30], 3)
	.add('Nature rune', [20, 30], 3)
	.add('Mud rune', [30, 70], 3)
	.add('Law rune', [10, 20], 2)

	/* Herbs */
	.add(HerbHerbDropTable, 1, 22)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 12)

	/* Materials */
	.add('Eye of newt', [25, 30], 2)
	.add('Potato cactus', [10, 15], 2)
	.add('White berries', [10, 15], 2)
	.add('Wine of zamorak', [5, 8], 2)

	/* Other */
	.add('Coins', [1000, 5000], 6)
	.add('Amulet of defence', 1, 5)
	.add('Amulet of magic', 1, 5)
	.add('Amulet of strength', 1, 5)

	/* Gem drop table */
	.add(GemTable, 1, 1);

export default new SimpleMonster({
	id: 2145,
	name: 'Undead Druid',
	table: UndeadDruidTable,
	aliases: ['undead druid']
});
