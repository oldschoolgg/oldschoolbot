import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ManiacalMonkeyTable = new LootTable()
	.every('Small ninja monkey bones')

	/* Weapons and armour */
	.add('Steel scimitar', 1, 2)
	.add('Maple shortbow', 1, 1)

	/* Materials */
	.add('Oak plank', 1, 3)
	.add('Grimy guam leaf', 1, 2)

	/* Other */
	.add('Bass', 2, 4)
	.add('Banana', 1, 2)
	.add('Antipoison(2)', 1, 2)
	.add('Prayer potion(1)', 1, 2)
	.add('Adamant arrow(p++)', 1, 1)
	.add('Rope', 1, 1);

export default new SimpleMonster({
	id: 7118,
	name: 'Maniacal monkey',
	table: ManiacalMonkeyTable,
	aliases: ['maniacal monkey', 'maniacal', 'mm']
});
