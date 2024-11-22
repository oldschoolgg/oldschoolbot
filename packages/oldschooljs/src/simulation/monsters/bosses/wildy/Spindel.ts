import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const SpindelUniqueTable = new LootTable()
	.oneIn(358, 'Dragon 2h sword')
	.oneIn(358, 'Dragon pickaxe')
	.oneIn(618, 'Fangs of venenatis')
	.oneIn(716, 'Treasonous ring')
	.oneIn(912, 'Voidwaker gem');

const SpindelSecondarySupplyTable = new LootTable({ limit: 18 })
	.add('Blighted anglerfish', [5, 6], 1)
	.add('Blighted karambwan', [5, 6], 1)
	.add('Blighted super restore(3)', [3, 4], 1)
	.add('Blighted super restore(4)', [3, 4], 1)
	.add('Ranging potion(2)', [2, 3], 1)
	.add('Super combat potion(2)', [2, 3], 1);

const SpindelTable = new LootTable()
	/* Unique table */
	.every(SpindelUniqueTable)

	/* Food and potions */
	.add('Dark crab', 8, 5)
	.add('Super restore(4)', 3, 5)

	/* Weapons and armour */
	.add('Rune pickaxe', 1, 12)
	.add('Rune knife', 30, 5)
	.add('Rune 2h sword', 1, 3)

	/* Runes and ammunition */
	.add('Chaos rune', 180, 7)
	.add('Blood rune', 150, 7)
	.add('Death rune', 220, 7)
	.add('Diamond bolts (e)', 60, 5)
	.add('Cannonball', 200, 4)

	/* Materials */
	.add('Uncut diamond', 9, 8)
	.add('Gold ore', 180, 6)
	.add('Magic logs', 60, 5)
	.add('Limpwurt root', 18, 5)
	.add('Onyx bolt tips', 35, 5)
	.add("Red spiders' eggs", 250, 3)
	.add('Uncut dragonstone', 1, 2)
	.add('Uncut ruby', 18, 1)
	.add('Grimy snapdragon', 60, 1)
	.add('Unicorn horn', 60, 1)

	/* Other */
	.add('Coins', 14_000, 21)
	.add('Supercompost', 60, 4)
	.add('Antidote++(4)', 6, 3)
	.add('Dark fishing bait', 200, 1)
	.add('Magic seed', 1, 1)
	.add('Palm tree seed', 1, 1)

	/* Tertiary */
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(2800, 'Venenatis spiderling');

const SpindelTotalTable = new LootTable().every(SpindelSecondarySupplyTable).every(SpindelTable);

export default new SimpleMonster({
	id: 11_998,
	name: 'Spindel',
	table: SpindelTotalTable,
	aliases: ['spin', 'spinny', 'spindel']
});
