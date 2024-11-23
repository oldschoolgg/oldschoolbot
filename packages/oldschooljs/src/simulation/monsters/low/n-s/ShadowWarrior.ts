import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const ShadowWarriorTable = new LootTable({ limit: 128 })
	/* Weapons and armour */
	.add('Adamant spear', 1, 1)
	.add('Black dagger(p)', 1, 1)
	.add('Black knife', 1, 1)
	.add('Black longsword', 1, 1)
	.add('Black robe', 1, 1)

	/* Runes*/
	.add('Cosmic rune', 3, 9)
	.add('Blood rune', 2, 6)
	.add('Air rune', 45, 4)
	.add('Death rune', 2, 4)

	/* Herbs */
	.add(HerbDropTable, 1, 18)

	/* Other */
	.add('Coins', 8, 47)
	.add('Mithril bar', 1, 4)
	.add('Weapon poison', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 8);

export default new SimpleMonster({
	id: 2853,
	name: 'Shadow warrior',
	table: ShadowWarriorTable,
	aliases: ['shadow warrior']
});
