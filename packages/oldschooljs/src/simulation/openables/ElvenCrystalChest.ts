import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';
import { itemTupleToTable } from '../../util';

/* Dragonstone armour roll */
const DragonStoneArmorTable = new LootTable()
	.add('Dragonstone full helm', 1, 1)
	.add('Dragonstone platebody', 1, 1)
	.add('Dragonstone platelegs', 1, 1)
	.add('Dragonstone gauntlets', 1, 1)
	.add('Dragonstone boots', 1, 1);

/* Key half roll */
const coinsKeyHalfTable = new LootTable()
	.every('Uncut dragonstone')
	.every('Coins', [10_000, 15_000])
	.add('Tooth half of key', 1, 1)
	.add('Loop half of key', 1, 1);

/* Rune armor roll */
const runeArmorTable = new LootTable()
	.every('Uncut dragonstone')
	.every('Crystal shard', [4, 6])
	.add('Rune platelegs', 1, 1)
	.add('Rune plateskirt', 1, 1);

/* Dragon items roll */
const dragonItemTable = new LootTable()
	.every('Uncut dragonstone')
	.add('Dragon platelegs', 1, 1)
	.add('Dragon plateskirt', 1, 1)
	.add('Shield left half', 1, 1);

const ElvenCrystalChestTable = new LootTable()
	.oneIn(10_000, 'Uncut onyx')
	.oneIn(500, DragonStoneArmorTable)
	.add(coinsKeyHalfTable, 1, 64)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Uncut ruby', [10, 13]],
			['Uncut diamond', [5, 8]]
		]),
		1,
		32
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Crystal key', 1]
		]),
		1,
		24
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Coins', [30_000, 50_000]],
			['Crystal shard', [8, 13]]
		]),
		1,
		20
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Crystal shard', [20, 30]]
		]),
		1,
		17
	)
	.add(runeArmorTable, 1, 17)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Cosmic rune', [50, 100]],
			['Chaos rune', [50, 100]],
			['Nature rune', [50, 100]],
			['Law rune', [50, 100]],
			['Death rune', [50, 100]]
		]),
		1,
		17
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Yew seed', 1]
		]),
		1,
		17
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Raw shark', [50, 100]]
		]),
		1,
		17
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Gold ore', [350, 500]]
		]),
		1,
		12
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Runite ore', [7, 10]]
		]),
		1,
		9
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Crystal acorn', [1, 2]]
		]),
		1,
		7
	)
	.add(dragonItemTable, 1, 3);

export default new SimpleOpenable({
	id: 23_951,
	name: 'Elven crystal chest',
	aliases: ['elven crystal chest', 'elven chest', 'enhanced', 'enhanced crystal chest', 'elven chest', 'elven'],
	table: ElvenCrystalChestTable
});
