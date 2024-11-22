import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import FixedAllotmentSeedTable from '../../../subtables/FixedAllotmentSeedTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const CatableponTable = new LootTable()
	.every('Bones')

	/* Armour */
	.add('Adamant med helm', 1, 1)

	/* Runes and ammunition */
	.add('Fire rune', 15, 7)
	.add('Water rune', 7, 6)
	.add('Law rune', 2, 4)
	.add('Mithril arrow', [5, 14], 4)
	.add('Cosmic rune', 2, 3)
	.add('Chaos rune', 7, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 3)

	/* Seeds */
	.add(FixedAllotmentSeedTable, 1, 1)

	/* Materials */
	.add('Eye of newt', 1, 7)
	.add('Pure essence', 15, 5)
	.add('Coal', [3, 7], 2)

	/* Coins */
	.add('Coins', 44, 12)
	.add('Coins', [5, 104], 10)
	.add('Coins', 15, 6)

	/* Other */
	.add('Unlit torch', 1, 9)
	.add('Top of sceptre', 1, 3)
	.add('Trout', 1, 2)

	/* Gem drop table */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(101, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 2475,
	name: 'Catablepon',
	table: CatableponTable,
	aliases: ['catablepon']
});
