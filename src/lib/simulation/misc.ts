import { LootTable } from 'oldschooljs';
import { itemTupleToTable } from '../util';

export const CrystalChestTable = new LootTable()
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Spinach roll', 1],
			['Coins', 2000]
		]),
		1,
		1
	)
	.add('Uncut dragonstone', 1)
	.add(
		itemTupleToTable([
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
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Ruby', 2],
			['Diamond', 2]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Runite bar', 3]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Iron ore', 150]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Coal', 100]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Raw swordfish', 5],
			['Coins', 1000]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Tooth half of key', 1],
			['Coins', 750]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Loop half of key', 1],
			['Coins', 750]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Adamant sq shield', 1]
		]),
		1,
		1
	)
	.add(
		itemTupleToTable([
			['Uncut dragonstone', 1],
			['Rune platelegs', 1]
		]),
		1,
		1
	);

export const CasketTable = new LootTable()
	.add('Coins', 160, 24)
	.add('Coins', 20, 22)
	.add('Coins', 40, 20)
	.add('Coins', 320, 19)
	.add('Coins', 80, 18)
	.add('Coins', 640, 18)
	.add('Uncut sapphire', 1, 64)
	.add('Uncut emerald', 1, 33)
	.add('Uncut ruby', 1, 15)
	.add('Uncut diamond', 1, 4)
	.add('Cosmic talisman', 1, 16)
	.add('Loop half of key', 1, 2)
	.add('Tooth half of key', 1, 2);

const SpoilsOfWarBaseTable = new LootTable()
	.add('Pure essence', [4000, 6000], 6)
	.add('Coins', [20_000, 30_000], 5)
	.add('Raw lobster', [30, 60], 5)
	.add('Raw swordfish', [30, 60], 5)
	.add('Raw shark', [30, 60], 5)
	.add('Blood rune', [150, 300], 5)
	.add('Death rune', [150, 300], 5)
	.add('Nature rune', [150, 300], 5)
	.add('Adamant bolts', [200, 400], 5)
	.add('Runite bolts', [100, 200], 5)
	.add('Adamant arrow', [200, 400], 5)
	.add('Rune arrow', [100, 200], 5)
	.add('Coal', [150, 300], 5)
	.add('Mithril ore', [80, 100], 5)
	.add('Coins', [2000, 3000], 4)
	.add('Uncut ruby', [15, 30], 4)
	.add('Uncut diamond', [15, 30], 4)
	.add('Soul rune', [150, 300], 2)
	.add('Soul rune', [500, 600], 2)
	.add('Rune full helm')
	.add('Rune platebody')
	.add('Rune platelegs')
	.add('Runite ore', [4, 8])
	.add('Tooth half of key')
	.add('Loop half of key')
	.add('Snapdragon seed')
	.add('Ranarr seed')
	.add(
		new LootTable()
			.add('Dragon med helm')
			.add('Dragon scimitar')
			.add('Dragon mace')
			.add('Dragon dagger')
			.add('Dragon longsword')
			.add('Bones')
			.add('Cabbage')
	);

export const SpoilsOfWarTable = new LootTable().tertiary(400, "Lil' creator").every(SpoilsOfWarBaseTable, 3);

export const NestBoxesTable = new LootTable()
	.add('Nest box (seeds)', 1, 12)
	.add('Nest box (ring)', 1, 5)
	.add('Nest box (empty)', 1, 3);

const BaseGemBagTable = new LootTable()
	.add('Uncut sapphire', 1, 4993)
	.add('Uncut emerald', 1, 3468)
	.add('Uncut ruby', 1, 1180)
	.add('Uncut diamond', 1, 309)
	.add('Uncut dragonstone', 1, 62)
	.oneIn(100_000_000, 'Uncut onyx');

export const BagFullOfGemsTable = new LootTable().every(BaseGemBagTable, 40);

export const BuildersSupplyCrateTable = new LootTable()
	.add('Oak plank', [28, 30])
	.add('Teak plank', [15, 16])
	.add('Mahogany plank', [6, 7])
	.add('Steel bar', [23, 24])
	.add('Soft clay', [45, 48])
	.add('Bolt of cloth', 15)
	.add('Limestone brick', 9);

export const NexUniqueTable = new LootTable()
	.add('Nihil horn', 1, 2)
	.add('Zaryte vambraces', 1, 3)
	.add('Ancient hilt', 1, 1)
	.add('Torva full helm (damaged)', 1, 2)
	.add('Torva platebody (damaged)', 1, 2)
	.add('Torva platelegs (damaged)', 1, 2);

const NexNonUniqueBaseTable = new LootTable()
	.add('Blood rune', [84, 325], 3)
	.add('Death rune', [85, 170], 3)
	.add('Soul rune', [86, 227], 3)
	.add('Dragon bolts (unf)', [12, 90], 3)
	.add('Cannonball', [42, 298], 3)
	.add('Air rune', [123, 1365])
	.add('Fire rune', [210, 1655])
	.add('Water rune', [193, 1599])
	.add('Onyx bolts (e)', [11, 29])
	.add('Air orb', [6, 20], 3)
	.add('Uncut ruby', [3, 26], 3)
	.add('Wine of zamorak', [4, 14], 3)
	.add('Coal', [23, 95])
	.add('Runite ore', [2, 28])
	.add(new LootTable().every('Shark', 3).every('Prayer potion(4)', 1), 1, 1)
	.add(new LootTable().every('Saradomin brew(4)', 2).every('Super restore(4)', 1), 1, 1)
	.add('Ecumenical key shard', [6, 39])
	.add('Blood essence', [1, 2])
	.add('Coins', [8539, 26_748]);

export const NexNonUniqueTable = new LootTable()
	.every(NexNonUniqueBaseTable, 2)
	.oneIn(25, 'Nihil shard', [1, 20])
	.oneIn(100, 'Rune sword');
