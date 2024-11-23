import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const AllotmentSeedTable = new LootTable()
	.add('Potato seed', 3, 15)
	.add('Onion seed', 3, 10)
	.add('Cabbage seed', 3, 8)
	.add('Tomato seed', 3, 7)
	.add('Sweetcorn seed', 3, 5)
	.add('Strawberry seed', 3, 4)
	.add('Watermelon seed', 3, 1);

const BushSeedTable = new LootTable()
	.add('Redberry seed', 2, 6)
	.add('Cadavaberry seed', 2, 4)
	.add('Dwellberry seed', 2, 3)
	.add('Jangerberry seed', 2, 3)
	.add('Whiteberry seed', 2, 2)
	.add('Poison ivy seed', 2, 2);

const HopsSeedTable = new LootTable()
	.add('Barley seed', 4, 15)
	.add('Hammerstone seed', 4, 10)
	.add('Asgarnian seed', 4, 8)
	.add('Jute seed', 4, 7)
	.add('Yanillian seed', 4, 5)
	.add('Krandorian seed', 4, 4)
	.add('Wildblood seed', 4, 1);

const FruitTreeSeedTable = new LootTable()
	.add('Apple tree seed', 1, 18)
	.add('Banana tree seed', 1, 12)
	.add('Orange tree seed', 1, 10)
	.add('Curry tree seed', 1, 6)
	.add('Pineapple seed', 1, 3)
	.add('Papaya tree seed', 1, 1);

export const MammothTable = new LootTable()
	.every('Big bones')

	/* Herbs */
	.add(HerbDropTable, 1, 8)

	/* Seeds */
	.add(AllotmentSeedTable, 1, 20)
	.add(BushSeedTable, 1, 20)
	.add(HopsSeedTable, 1, 20)
	.add(FruitTreeSeedTable, 1, 10)

	/* Other */
	.add('Coins', 30, 13)
	.add('Coins', 180, 7)
	.add('Acorn', 1, 5)
	.add('Limpwurt seed', 2, 5)
	.add('Prayer potion(1)', 1, 5)
	.add('Steel arrow', 5, 5)
	.add('Lobster', 2, 3)
	.add('Dark fishing bait', 12, 2)

	/* Gem drop table */
	.add(RareDropTable, 1, 2)
	.add(GemTable, 1, 3)

	/* Tertiary */
	.oneIn(128, 'Clue scroll (medium)')
	.oneIn(400, 'Long bone')
	.oneIn(5013, 'Curved bone');

export default new SimpleMonster({
	id: 6604,
	name: 'Mammoth',
	table: MammothTable,
	aliases: ['mammoth']
});
