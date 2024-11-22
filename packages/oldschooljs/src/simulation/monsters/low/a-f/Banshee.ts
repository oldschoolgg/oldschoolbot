import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const BansheePreTable = new LootTable({ limit: 128 })
	.oneIn(512, 'Mystic gloves (dark)', 1)

	/* Weapons and armour */
	.add('Iron mace', 1, 2)
	.add('Iron dagger', 1, 2)
	.add('Iron kiteshield', 1, 1)

	/* Runes and ammunition */
	.add('Air rune', 3, 3)
	.add('Cosmic rune', 2, 3)
	.add('Chaos rune', 3, 2)
	.add('Fire rune', 7, 1)
	.add('Chaos rune', 7, 1)

	/* Materials */
	.add('Pure essence', 13, 22)
	.add('Iron ore', 1, 1)

	/* Coins */
	.add('Coins', 13, 10)
	.add('Coins', 26, 8)
	.add('Coins', 35, 8)

	/* Other */
	.add('Fishing bait', 15, 22)
	.add('Fishing bait', 7, 5)
	.add('Eye of newt', 1, 1)

	/* Subtables */
	.add(HerbDropTable, 1, 34)
	.add(GemTable, 1, 2);

const BansheeTable = new LootTable().tertiary(128, 'Clue scroll (easy)', 1).every(BansheePreTable);

export default new SimpleMonster({
	id: 414,
	name: 'Banshee',
	table: BansheeTable,
	aliases: ['banshee']
});
