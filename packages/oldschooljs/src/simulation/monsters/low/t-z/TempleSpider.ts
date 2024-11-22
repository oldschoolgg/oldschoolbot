import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

const TatteredPageTable = new LootTable()
	.add('Tattered moon page')
	.add('Tattered sun page')
	.add('Tattered temple page');

export const TempleSpiderTable = new LootTable()
	/* Tertiary */
	.tertiary(30, TatteredPageTable)
	.tertiary(100, 'Grubby key')
	.tertiary(200, 'Clue scroll (hard)')

	/* Weapons and armour */
	.add('Adamant longsword', 1, 4)
	.add('Adamant med helm', 1, 4)
	.add('Rune dagger', 1, 1)
	.add('Rune med helm', 1, 1)

	/* Runes */
	.add('Air rune', [30, 50], 5)
	.add('Earth rune', [30, 50], 5)
	.add('Fire rune', [30, 50], 5)
	.add('Water rune', [30, 50], 5)
	.add('Chaos rune', [10, 15], 2)
	.add('Cosmic rune', [10, 15], 2)
	.add('Death rune', [10, 15], 2)
	.add('Nature rune', [10, 15], 2)
	.add('Law rune', 5, 1)
	.add('Soul rune', 5, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 6)

	/* Other */
	.add('Coins', [400, 600], 17)
	.add("Red spiders' eggs", [3, 5], 8)
	.add('Superantipoison(2)', 1, 8)
	.add('Weapon poison(+)', 1, 2)

	/* Gem drop table */
	.add(GemTable, 1, 1);

export default new SimpleMonster({
	id: 8703,
	name: 'Temple Spider',
	table: TempleSpiderTable,
	aliases: ['temple spider']
});
