import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const SkeletonHellhoundTable = new LootTable().every('Bones').oneIn(5000, 'Skeleton champion scroll');

const VetionUniqueTable = new LootTable()
	.oneIn(196, "Skull of vet'ion")
	.oneIn(256, 'Dragon 2h sword')
	.oneIn(256, 'Dragon pickaxe')
	.oneIn(360, 'Voidwaker blade')
	.oneIn(512, 'Ring of the gods');

const VetionSecondarySupplyTable = new LootTable({ limit: 18 })
	.add('Blighted anglerfish', [5, 6], 1)
	.add('Blighted karambwan', [5, 6], 1)
	.add('Blighted super restore(3)', [3, 4], 1)
	.add('Blighted super restore(4)', [3, 4], 1)
	.add('Ranging potion(2)', [2, 3], 1)
	.add('Super combat potion(2)', [2, 3], 1);

const VetionTable = new LootTable()
	.every('Big bones')
	.every(SkeletonHellhoundTable, 4)

	/* Unique table */
	.every(VetionUniqueTable)

	/* Weapons and armour */
	.add('Rune pickaxe', 5, 8)
	.add('Rune dart', 150, 3)
	.add('Rune knife', 150, 3)
	.add('Mystic fire staff', 4, 2)
	.add('Mystic water staff', 4, 2)
	.add('Mystic robe top', 4, 2)
	.add('Mystic robe bottom', 4, 2)
	.add('Rune full helm', 4, 2)

	/* Runes and ammunition */
	.add('Chaos rune', 900, 7)
	.add('Death rune', 700, 7)
	.add('Blood rune', 500, 7)
	.add('Cannonball', 550, 4)

	/* Materials */
	.add('Gold ore', 675, 6)
	.add('Limpwurt root', 60, 5)
	.add('Wine of zamorak', 100, 5)
	.add('Magic logs', 225, 5)
	.add('Oak plank', 400, 5)
	.add('Uncut ruby', 75, 4)
	.add('Uncut diamond', 35, 3)
	.add('Dragon bones', 150, 3)
	.add('Uncut dragonstone', 5, 2)
	.add('Mort myre fungus', 450, 2)
	.add('Grimy ranarr weed', 100, 1)
	.add('Grimy dwarf weed', 45, 1)
	.add('Grimy snapdragon', 45, 1)
	.add('Grimy toadflax', 45, 1)

	/* Other */
	.add('Coins', 50_000, 10)
	.add('Super restore(4)', 10, 5)
	.add('Sanfew serum(4)', 20, 5)
	.add('Dark crab', 50, 5)
	.add('Supercompost', 225, 4)
	.add('Wilderness crabs teleport', 4, 3)
	.add('Blighted anglerfish', 100, 1)

	/* Tertiary */
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(400, 'Long bone')
	.tertiary(1500, "Vet'ion jr.")
	.tertiary(5000, 'Skeleton champion scroll')
	.tertiary(5013, 'Curved bone');

const VetionTotalTable = new LootTable().every(VetionSecondarySupplyTable).every(VetionTable);

export default new SimpleMonster({
	id: 6611,
	name: "Vet'ion",
	table: VetionTotalTable,
	aliases: ['vetion', "vet'ion", 'vet']
});
