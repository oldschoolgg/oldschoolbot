import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../../util';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const CrazyArchaeologistUniqueTable = new LootTable().add('Odium shard 2').add('Malediction shard 2');

const CrazyArchaeologistTable = new LootTable()
	.every('Bones')
	.tertiary(128, 'Clue scroll (hard)')
	.add(CrazyArchaeologistUniqueTable, 1, 1)

	/* Weapons and armour */
	.add('Amulet of power', 1, 7)
	.add('Rune crossbow', 2, 5)
	.add("Red d'hide body", 1, 4)
	.add('Rune knife', 10, 4)

	/* Runes and ammunition */

	.add('Mud rune', 30, 4)
	.add('Cannonball', 150, 4)
	.add('Dragon arrow', 75, 1)

	/* Consumables */
	.add('Shark', 1, 8)
	.add('Potato with cheese', 3, 8)
	.add('Prayer potion(4)', 1, 8)
	.add('Anchovy pizza', 8, 4)

	/* Other */
	.add('Coins', [499, 3998], 18)
	.add('Grimy dwarf weed', 4, 8)
	.add('White berries', 10, 6)
	.add('Silver ore', 40, 6)
	.add(
		itemTupleToTable([
			['Uncut emerald', 6],
			['Uncut sapphire', 4]
		]),
		1,
		5
	)
	.add('Red dragonhide', 10, 5)
	.add('Rusty sword', 1, 4)
	.add('Muddy key', 1, 4)
	.add('Onyx bolt tips', 12, 4)
	.add('Long bone', 1, 2)
	.add('Fedora', 1, 1)

	/* Subtables */
	.add(RareDropTable, 1, 4)
	.add(GemTable, 1, 4);

export default new SimpleMonster({
	id: 6618,
	name: 'Crazy Archaeologist',
	table: CrazyArchaeologistTable,
	aliases: ['crazy arch', 'crazy archaeologist']
});
