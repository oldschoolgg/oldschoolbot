import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const CockatricePreTable = new LootTable({ limit: 128 })
	/* Weapons and armour */
	.add('Iron sword', 1, 3)
	.add('Steel dagger', 1, 3)
	.add('Iron boots', 1, 1)
	.add('Iron javelin', 1, 1)
	.add('Steel longsword', 1, 1)
	.oneIn(512, 'Mystic boots (light)')

	/* Runes */
	.add('Nature rune', 2, 6)
	.add('Nature rune', 4, 4)
	.add('Law rune', 2, 3)
	.add('Nature rune', 6, 2)
	.add('Water rune', 2, 2)
	.add('Fire rune', 7, 2)

	/* Herbs */
	.add(HerbDropTable, 1, 10)

	/* Coins */
	.add('Coins', 15, 16)
	.add('Coins', 5, 12)
	.add('Coins', 28, 12)
	.add('Coins', 62, 4)
	.add('Coins', 42, 3)
	.add('Coins', 1, 1)

	/* Other */
	.add('Limpwurt root', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 2);

const CockatriceTable = new LootTable()
	.every('Bones')
	.every(CockatricePreTable)

	/* Tertiary */
	.oneIn(128, 'Clue scroll (medium)')
	.oneIn(1000, 'Cockatrice head');

export default new SimpleMonster({
	id: 420,
	name: 'Cockatrice',
	table: CockatriceTable,
	aliases: ['cockatrice']
});
