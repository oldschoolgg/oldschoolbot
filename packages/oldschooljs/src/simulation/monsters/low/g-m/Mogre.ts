import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { UncommonSeedDropTable } from '../../../subtables/index';

export const MogreTable = new LootTable()
	.every('Big bones')

	/* Runes */
	.add('Water rune', 5, 4)
	.add('Water rune', 7, 4)
	.add('Water rune', 14, 4)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 13)

	/* Fish */
	.add('Raw swordfish', 1, 20)
	.add('Raw tuna', 1, 9)
	.add('Raw pike', 1, 7)
	.add('Raw salmon', 1, 4)
	.add('Raw herring', 1, 3)
	.add('Raw sardine', 1, 3)
	.add('Raw shark', 1, 3)

	/* Other */
	.add('Fishing bait', 5, 30)
	.add('Fishing bait', 15, 10)
	.add('Mudskipper hat', 1, 5)
	.add('Oyster', 1, 3)
	.add('Flippers', 1, 2)
	.add('Seaweed', 1, 2)
	.add('Staff of water', 1, 1)
	.add('Fishbowl', 1, 1)

	/* Tertiary */
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 2592,
	name: 'Mogre',
	table: MogreTable,
	aliases: ['mogre']
});
