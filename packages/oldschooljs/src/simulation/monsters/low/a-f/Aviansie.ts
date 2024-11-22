import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const AviansieTable = new LootTable({ limit: 128 })
	.every('Bones')
	.every('Feather', [1, 6])

	/* Runes */
	.add('Air rune', 15, 18)
	.add('Water rune', 30, 13)
	.add('Law rune', 2, 4)
	.add('Nature rune', 9, 4)
	.add('Chaos rune', 3, 3)
	.add('Body rune', 12, 2)
	.add('Blood rune', 11, 2)
	.add('Mind rune', 5, 1)
	.add('Chaos rune', 16, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Materials */
	.add('Adamantite bar', 4, 30)
	.add('Silver ore', 1, 10)
	.add('Runite limbs', 1, 1)

	/* Other */
	.add('Rune dagger(p+)', 1, 11)
	.add('Antipoison(3)', 5, 5)
	.add('Swordfish', 5, 2)

	/* RDT */
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(35, 'Ensouled aviansie head')
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 3169,
	name: 'Aviansie',
	table: AviansieTable,
	aliases: ['aviansie', 'avi']
});
