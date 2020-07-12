import LootTable from 'oldschooljs/dist/structures/LootTable';

/* Dragonstone armour roll */
const DragonStoneTable = new LootTable()
    .add('Dragonstone full helm', 1, 1)
    .add('Dragonstone platebody', 1, 1)
    .add('Dragonstone platelegs', 1, 1)
    .add('Dragonstone gauntlets', 1, 1)
    .add('Dragonstone boots', 1, 1);

const ElvenCrystalChestTable = new LootTable()
	.oneIn(10000,'Uncut onyx')
    .oneIn(500, DragonStoneTable)
    .add(
		[
			['Uncut dragonstone', 1],
			['Tooth half of key', 1],
			['Coins', [10000, 15000]]
		],
		1,
		32
	)
	.add(
		[
			['Uncut dragonstone', 1],
			['Loop half of key', 1],
			['Coins', [10000, 15000]]
		],
		1,
		32
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Uncut ruby', [10, 13]],
			['Uncut diamond', [5, 8]]
		],
		1,
		32
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Crystal key', 1]
		],
		1,
		24
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Coins', [30000, 50000]],
			['Crystal shard', [8, 13]]
		],
		1,
		20
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Crystal shard', [20, 30]]
		],
		1,
		17
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Crystal shard', [4, 6]],
            ['Rune platelegs', 1]
		],
		1,
		9
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Crystal shard', [4, 6]],
            ['Rune plateskirt', 1]
		],
		1,
		8
    )
	.add(
		[
			['Uncut dragonstone', 1],
			['Cosmic rune', [50, 100]],
			['Chaos rune', [50, 100]],
			['Nature rune', [50, 100]],
			['Law rune', [50, 100]],
			['Death rune', [50, 100]]
		],
		1,
		17
	)
	.add(
		[
			['Uncut dragonstone', 1],
			['Yew seed', 1]
		],
		1,
		17
	)
	.add(
		[
			['Uncut dragonstone', 1],
			['Raw shark', [50, 100]]
		],
		1,
		17
	)
	.add(
		[
			['Uncut dragonstone', 1],
			['Gold ore', [350, 500]]
		],
		1,
		12
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Runite ore', [7, 10]]
		],
		1,
		9
	)
	.add(
		[
			['Uncut dragonstone', 1],
			['Crystal acorn', [1, 2]]
		],
		1,
		7
	)
	.add(
		[
			['Uncut dragonstone', 1],
			['Dragon platelegs', 1]
		],
		1,
		1
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Dragon plateskirt', 1]
		],
		1,
		1
    )
    .add(
		[
			['Uncut dragonstone', 1],
			['Shield left half', 1]
		],
		1,
		1
    );
    
export default ElvenCrystalChestTable;