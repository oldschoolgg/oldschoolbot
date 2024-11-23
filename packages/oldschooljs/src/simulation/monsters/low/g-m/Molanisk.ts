import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable from '../../../subtables/RareDropTable';

const MolaniskTable = new LootTable()
	.every('Bones')

	/* Runes */
	.add('Water rune', [1, 14], 10)
	.add('Earth rune', [1, 20], 10)
	.add('Cosmic rune', [1, 7], 5)
	.add('Nature rune', [1, 5], 3)
	.add('Mud rune', [1, 15], 2)

	/* Herbs */
	.add(HerbDropTable, 1, 32)

	/* Other */
	.add('Swamp weed', [1, 4], 37)
	.add('Swamp weed', [5, 8], 10)
	.add('Coins', [1, 75], 10)
	.add('Mole claw', 1, 1)

	/* Rare drop table */
	.add(RareDropTable, 1, 7)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (easy)');

export default new SimpleMonster({
	id: 1,
	name: 'Molanisk',
	table: MolaniskTable,
	aliases: ['molanisk']
});
