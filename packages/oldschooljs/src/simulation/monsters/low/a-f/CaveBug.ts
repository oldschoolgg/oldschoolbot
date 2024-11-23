import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';

export const CaveBugTable = new LootTable({ limit: 128 })
	/* Runes and ammunition */
	.add('Water rune', 8, 5)
	.add('Nature rune', 1, 5)
	.add('Earth rune', 6, 2)
	.add('Nature rune', 2, 1)

	.add(HerbDropTable, 1, 24)

	/* Materials */
	.add('Unicorn horn dust', 1, 2)
	.add('Eye of newt', 1, 2)
	.add("Red spiders' eggs", 1, 2)
	.add('Limpwurt root', 1, 1)
	.add('Snape grass', 1, 1)

	/* Other */
	.add('Coins', 3, 8)
	.add('Coins', 8, 3)
	.add('Candle', 1, 5)
	.add('Tinderbox', 1, 3)
	.add('Empty candle lantern', 1, 1);

export default new SimpleMonster({
	id: 481,
	name: 'Cave Bug',
	table: CaveBugTable,
	aliases: ['cave bug']
});
