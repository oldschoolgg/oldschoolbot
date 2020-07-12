import LootTable from 'oldschooljs/dist/structures/LootTable';

const CrystalChestTable = new LootTable({limit: 256})
    .every('Uncut dragonstone')
	.add(
		[
			['Spinach roll', 1],
			['Coins', 2000]
		],
		1,
		68
	)
	.add(
		[
			['Air rune', 50],
			['Water rune', 50],
			['Earth rune', 50],
			['Fire rune', 50],
			['Body rune', 50],
			['Mind rune', 50],
			['Chaos rune', 10],
			['Death rune', 10],
			['Cosmic rune', 10],
			['Nature rune', 10],
			['Law rune', 10]
		],
		1,
		24
	)
	.add(
		[
			['Ruby', 2],
			['Diamond', 2]
		],
		1,
		24
	)
	.add('Runite bar', 3, 24)
	.add('Iron ore', 150, 20)
	.add('Coal', 100, 20)
	.add(
		[
			['Raw swordfish', 5],
			['Coins', 1000]
		],
		1,
		16
	)
	.add(
		[
			['Tooth half of key', 1],
			['Coins', 750]
		],
		1,
		10
	)
	.add(
		[
			['Loop half of key', 1],
			['Coins', 750]
		],
		1,
		10
	)
	.add('Adamant sq shield', 1, 4)
	.add('Rune platelegs', 1, 1)
    .add('Rune plateskirt', 1, 1);

export default CrystalChestTable;