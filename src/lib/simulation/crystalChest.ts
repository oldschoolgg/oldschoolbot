import LootTable from 'oldschooljs/dist/structures/LootTable';

const CrystalChestTable = new LootTable()
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Spinach roll', 1],
			['Coins', 2000]
		],
		1,
		1
	)
	.addItem('Uncut dragonstone', 1)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Air rune', 50],
			['Water rune', 50],
			['Earth rune', 50],
			['Fire rune', 50],
			['Body rune', 10],
			['Mind rune', 10],
			['Chaos rune', 10],
			['Death rune', 10],
			['Cosmic rune', 10],
			['Nature rune', 10],
			['Law rune', 10]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Ruby', 2],
			['Diamond', 2]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Runite bar', 3]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Iron ore', 150]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Coal', 100]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Raw swordfish', 5],
			['Coins', 1000]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Tooth half of key', 1],
			['Coins', 750]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Loop half of key', 1],
			['Coins', 750]
		],
		1,
		1
	)
	.addItem(
		[
			['Uncut dragonstone', 1],
			['Adamant sq shield', 1]
		],
		1,
		1
	)
	.addItem([['Uncut dragonstone'], ['Rune platelegs']], 1, 1);

export default CrystalChestTable;
