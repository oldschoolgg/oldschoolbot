import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable from '../../subtables/RareDropTable';
import { GemTable } from '../../subtables/RareDropTable';
import TreeHerbSeedTable from '../../subtables/TreeHerbSeedTable';

const DerangedArchaeologistTable = new LootTable()
	.every('Bones')

	/* Weapons and armour */
	.add("Black d'hide body", 1, 6)
	.add('Rune sword', 1, 4)
	.add('Rune 2h sword', 1, 3)

	/* Runes and ammunition */
	.add('Water rune', 100, 6)
	.add('Mud rune', 40, 6)
	.add('Rune knife', 25, 6)
	.add('Cannonball', 80, 4)
	.add('Dragon arrow', 60, 1)

	/* Seeds */
	.add(TreeHerbSeedTable, 1, 1)

	/* Materials */
	.add('Grimy dwarf weed', 4, 8)
	.add('White berries', 10, 7)
	.add('Black dragonhide', 8, 6)
	.add('Gold ore', 10, 6)
	.add('Onyx bolt tips', 6, 6)
	.add('Runite limbs', 1, 5)
	.add('Uncut diamond', 5, 5)

	/* Consumables */
	.add('Prayer potion(3)', 1, 8)
	.add('Potato with cheese', 3, 8)
	.add('Shark', 2, 8)
	.add('Anchovy pizza', 2, 4)

	/* Other */
	.add('Crystal key', 1, 7)
	.add('Long bone', 1, 2)

	/* Subtables */
	.add(RareDropTable, 1, 6)
	.add(GemTable, 1, 6)

	/* Tertiary */
	.tertiary(2, 'Numulite', [5, 32])
	.tertiary(15, 'Unidentified large fossil')
	.tertiary(29, 'Unidentified small fossil')
	.tertiary(58, 'Unidentified medium fossil')
	.tertiary(200, 'Clue scroll (elite)')
	.tertiary(292, 'Unidentified rare fossil');

export default new SimpleMonster({
	id: 7806,
	name: 'Deranged Archaeologist',
	table: DerangedArchaeologistTable,
	aliases: ['deranged arch', 'deranged archaeologist']
});
