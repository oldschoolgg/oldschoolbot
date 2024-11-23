import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const ArtioUniqueTable = new LootTable()
	.oneIn(358, 'Dragon 2h sword')
	.oneIn(358, 'Dragon pickaxe')
	.oneIn(618, 'Claws of callisto')
	.oneIn(716, 'Tyrannical ring')
	.oneIn(912, 'Voidwaker hilt');

const ArtioSecondarySupplyTable = new LootTable({ limit: 18 })
	.add('Blighted anglerfish', [5, 6], 1)
	.add('Blighted karambwan', [5, 6], 1)
	.add('Blighted super restore(3)', [3, 4], 1)
	.add('Blighted super restore(4)', [3, 4], 1)
	.add('Ranging potion(2)', [2, 3], 1)
	.add('Super combat potion(2)', [2, 3], 1);

const ArtioTable = new LootTable()
	.every('Big bones')

	/* Unique table */
	.every(ArtioUniqueTable)

	/* Food and potions */
	.add('Dark crab', 9, 5)
	.add('Super restore(4)', 3, 5)

	/* Weapons and armour */
	.add('Rune pickaxe', 1, 12)
	.add('Rune 2h sword', 1, 3)

	/* Runes and ammunition */
	.add('Chaos rune', 300, 7)
	.add('Death rune', 220, 7)
	.add('Blood rune', 140, 7)
	.add('Soul rune', 200, 5)
	.add('Cannonball', 190, 4)

	/* Materials */
	.add('Mahogany logs', 200, 6)
	.add('Limpwurt root', 20, 5)
	.add('Magic logs', 60, 5)
	.add('Uncut ruby', 22, 4)
	.add('Uncut diamond', 9, 3)
	.add('Dragon bones', 25, 3)
	.add('Red dragonhide', 55, 3)
	.add('Uncut dragonstone', 1, 2)
	.add('Coconut', 30, 2)
	.add('Grimy toadflax', 60, 1)

	/* Seeds */
	.add('Ranarr seed', 3, 5)
	.add('Snapdragon seed', 2, 5)
	.add('Yew seed', 1, 1)
	.add('Magic seed', 1, 1)
	.add('Palm tree seed', 1, 1)

	/* Other */
	.add('Coins', 12_000, 21)
	.add('Supercompost', 60, 4)
	.add('Dark fishing bait', 300, 1)

	/* Tertiary */
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(400, 'Long bone')
	.tertiary(2800, 'Callisto cub')
	.tertiary(5013, 'Curved bone');

const ArtioTotalTable = new LootTable().every(ArtioSecondarySupplyTable).every(ArtioTable);

export default new SimpleMonster({
	id: 11_992,
	name: 'Artio',
	table: ArtioTotalTable,
	aliases: ['artio']
});
