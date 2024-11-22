import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const SkeletonHellhoundTable = new LootTable().every('Bones').oneIn(5000, 'Skeleton champion scroll');

const CalvarionUniqueTable = new LootTable()
	.oneIn(358, 'Dragon 2h sword')
	.oneIn(358, 'Dragon pickaxe')
	.oneIn(618, "Skull of vet'ion")
	.oneIn(716, 'Ring of the gods')
	.oneIn(912, 'Voidwaker blade');

const CalvarionSecondarySupplyTable = new LootTable({ limit: 18 })
	.add('Blighted anglerfish', [5, 6], 1)
	.add('Blighted karambwan', [5, 6], 1)
	.add('Blighted super restore(3)', [3, 4], 1)
	.add('Blighted super restore(4)', [3, 4], 1)
	.add('Ranging potion(2)', [2, 3], 1)
	.add('Super combat potion(2)', [2, 3], 1);

const CalvarionTable = new LootTable()
	.every('Big bones')
	.every(SkeletonHellhoundTable, 4)

	/* Unique table */
	.every(CalvarionUniqueTable)

	/* Food and potions */
	.add('Dark crab', 8, 5)
	.add('Super restore(4)', 3, 5)

	/* Weapons and armour */
	.add('Rune pickaxe', 1, 12)
	.add('Ancient staff', 1, 3)
	.add('Rune 2h sword', 1, 3)

	/* Runes and ammunition */
	.add('Chaos rune', 220, 7)
	.add('Death rune', 120, 7)
	.add('Blood rune', 180, 7)
	.add('Cannonball', 180, 4)

	/* Materials */
	.add('Gold ore', 200, 6)
	.add('Limpwurt root', 19, 5)
	.add('Magic logs', 60, 5)
	.add('Oak plank', 220, 5)
	.add('Wine of zamorak', 35, 5)
	.add('Uncut ruby', 22, 4)
	.add('Uncut diamond', 9, 3)
	.add('Dragon bones', 60, 3)
	.add('Uncut dragonstone', 1, 2)
	.add('Mort myre fungus', 120, 2)
	.add('Grimy ranarr weed', 60, 1)

	/* Other */
	.add('Coins', 12_000, 21)
	.add('Sanfew serum(4)', 6, 5)
	.add('Supercompost', 60, 4)
	.add('Yew seed', 1, 1)
	.add('Magic seed', 1, 1)
	.add('Palm tree seed', 1, 1)
	.add('Dark fishing bait', 280, 1)

	/* Tertiary */
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(400, 'Long bone')
	.tertiary(2800, "Vet'ion jr.")
	.tertiary(5000, 'Skeleton champion scroll')
	.tertiary(5013, 'Curved bone');

const CalvarionTotalTable = new LootTable().every(CalvarionSecondarySupplyTable).every(CalvarionTable);

export default new SimpleMonster({
	id: 11_993,
	name: "Calvar'ion",
	table: CalvarionTotalTable,
	aliases: ['calvarion', "calvar'ion", 'calvar']
});
