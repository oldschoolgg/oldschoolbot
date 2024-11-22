import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const KillerwattTable = new LootTable()
	.every('Ashes')

	/* Weapons */
	.add('Staff of fire', 1, 2)
	.add('Staff of air', 1, 2)
	.add('Fire battlestaff', 1, 1)
	.add('Air battlestaff', 1, 1)
	.oneIn(512, 'Mystic fire staff')

	/* Runes and ammunition */
	.add('Nature rune', 8, 11)
	.add('Chaos rune', 4, 9)
	.add('Fire rune', 45, 8)
	.add('Fire rune', 18, 5)
	.add('Air rune', 5, 3)
	.add('Death rune', 2, 3)
	.add('Air rune', 17, 2)
	.add('Steam rune', 2, 2)
	.add('Cannonball', 3, 2)
	.add('Nature rune', 37, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 35)

	/* Coins */
	.add('Coins', 44, 28)
	.add('Coins', 11, 23)
	.add('Coins', 200, 11)
	.add('Coins', 76, 1)
	.add('Coins', 127, 1)

	/* Other */
	.add('Fire orb', 2, 1)
	.add('Soda ash', 4, 1)

	/* Gem drop table */
	.add(GemTable, 1, 5);

export default new SimpleMonster({
	id: 469,
	name: 'Killerwatt',
	table: KillerwattTable,
	aliases: ['killerwatt']
});
