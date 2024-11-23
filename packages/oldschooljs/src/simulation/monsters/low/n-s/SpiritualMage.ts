import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const SpiritualMageTable = new LootTable()

	/* Armour */
	.add('Dragon boots', 1, 1)

	/* Elemental runes */
	.add('Air rune', 30, 9)
	.add('Water rune', 15, 8)
	.add('Water rune', 50, 7)
	.add('Air rune', 50, 2)
	.add('Fire rune', 65, 2)

	/* Combination runes */
	.add('Dust rune', 15, 11)
	.add('Mud rune', 20, 7)
	.add('Mist rune', 20, 6)

	/* Catalytic runes */
	.add('Chaos rune', 10, 18)
	.add('Astral rune', 15, 9)
	.add('Death rune', 15, 8)
	.add('Nature rune', 25, 7)
	.add('Mind rune', 50, 4)
	.add('Nature rune', 18, 4)
	.add('Body rune', 35, 3)
	.add('Law rune', 15, 2)
	.add('Body rune', 25, 2)
	.add('Blood rune', 10, 2)
	.add('Chaos rune', 25, 1)

	/* Other */
	.add('Pure essence', 90, 6)
	.add('Antipoison(3)', 5, 5)

	/* RDT */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 2212,
	name: 'Spiritual Mage',
	table: SpiritualMageTable,
	aliases: ['spiritual mage']
});
