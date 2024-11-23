import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';
import { itemTupleToTable } from '../../util';

const FoodTable = new LootTable()
	.add('Egg potato', 4, 12)
	.add('Shark', 4, 7)
	.add(
		itemTupleToTable([
			['Saradomin brew(2)', 3],
			['Super restore(2)', 1]
		]),
		1,
		1
	);

const PotionTable = new LootTable()
	.add(
		itemTupleToTable([
			['Super attack(2)', 1],
			['Super strength(2)', 1],
			['Super defence(2)', 1]
		]),
		1,
		8
	)
	.add(
		itemTupleToTable([
			['Super defence(2)', 1],
			['Ranging potion(2)', 1]
		]),
		1,
		8
	)
	.add('Prayer potion(3)', 2, 3)
	.add('Super restore(3)', 2, 1);

const GrubbyChestTable = new LootTable()
	/* Food roll */
	.every(FoodTable, 2)

	/* Potion roll */
	.every(PotionTable, 1)

	/* Main roll */
	.add('Law rune', 200, 10)
	.add('Death rune', 200, 10)
	.add('Astral rune', 200, 10)
	.add('Blood rune', 200, 10)
	.add('Grimy toadflax', 10, 8)
	.add('Grimy ranarr weed', 10, 8)
	.add('Coins', 10_000, 8)
	.add('Grimy snapdragon', 10, 7)
	.add('Grimy torstol', 5, 7)
	.add('Crystal key', 1, 6)
	.add('Dragon bones', 10, 6)
	.add('Red dragonhide', 10, 6)
	.add('Dragon dart tip', 50, 2)
	.add('Dragon arrowtips', 100, 2)

	/* Tertiary */
	.tertiary(25, 'Orange egg sac')
	.tertiary(25, 'Blue egg sac');

export default new SimpleOpenable({
	id: 23_499,
	name: 'Grubby chest',
	aliases: ['grubby chest', 'grubby'],
	table: GrubbyChestTable
});
