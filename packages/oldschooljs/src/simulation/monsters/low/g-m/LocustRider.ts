import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const LocustRiderTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Weapons and armor */
	.add('Adamant kiteshield', 1, 3)
	.add('Battlestaff', 3, 2)
	.add('Rune dagger', 1, 2)
	.add('Rune mace', 1, 1)
	.add('Rune sq shield', 1, 1)

	/* Runes and ammunition */
	.add('Adamant arrow', 36, 4)
	.add('Blood rune', 18, 4)
	.add('Fire rune', 250, 2)
	.add('Cosmic rune', 35, 2)
	.add('Lava rune', 150, 2)
	.add('Rune arrow', 18, 2)

	/* Herbs */
	.add(HerbDropTable, 1, 20)

	/* Seeds */
	.add(RareSeedTable, 1, 2)

	/* Materials */
	.add('Raw lobster', 15, 7)
	.add('Coal', 32, 6)
	.add('Raw bass', 24, 4)
	.add('Uncut sapphire', 4, 3)
	.add('Adamantite ore', 14, 2)
	.add('Desert goat horn', 6, 2)
	.add('Mithril bar', 22, 2)

	/* Other */
	.add('Coins', [2000, 3000], 32)
	.add('Bass', 6, 4)
	.add('Waterskin(4)', 1, 1)
	.add('Lobster', 5, 1)
	.add('Marrentill tar', 80, 1)

	/* RDT */
	.add(RareDropTable, 1, 1)
	.add(GemTable, 1, 15);

export default new SimpleMonster({
	id: 795,
	name: 'Locust Rider',
	table: LocustRiderTable,
	aliases: ['locust rider', 'locust']
});
