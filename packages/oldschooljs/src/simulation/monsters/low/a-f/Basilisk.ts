import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const BasiliskPreTable = new LootTable()
	/* Weapons and armour */
	.add('Mithril axe', 1, 3)
	.add('Steel battleaxe', 1, 3)
	.add('Mithril spear', 1, 2)
	.add('Adamant full helm', 1, 1)
	.add('Mithril kiteshield', 1, 1)
	.add('Rune dagger', 1, 1)
	.oneIn(512, 'Mystic hat (light)')

	/* Runes */
	.add('Water rune', 75, 8)
	.add('Nature rune', 15, 5)
	.add('Law rune', 3, 3)
	.add('Nature rune', 37, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 35)

	/* Materials */
	.add('Adamantite ore', 1, 3)

	/* Coins */
	.add('Coins', 44, 29)
	.add('Coins', 200, 17)
	.add('Coins', 132, 5)
	.add('Coins', 11, 5)
	.add('Coins', 440, 1)

	/* RDT */
	.add(GemTable, 1, 5);

const BasiliskTable = new LootTable()
	.every('Bones')
	.every(BasiliskPreTable)

	/* Tertiary */
	.tertiary(2000, 'Basilisk head');

export default new SimpleMonster({
	id: 417,
	name: 'Basilisk',
	table: BasiliskTable,
	aliases: ['basilisk', 'basi']
});
