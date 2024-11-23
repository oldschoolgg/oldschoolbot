import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const VenenatisUniqueTable = new LootTable()
	.oneIn(196, 'Fangs of venenatis')
	.oneIn(256, 'Dragon 2h sword')
	.oneIn(256, 'Dragon pickaxe')
	.oneIn(360, 'Voidwaker gem')
	.oneIn(512, 'Treasonous ring');

const VenenatisSecondarySupplyTable = new LootTable({ limit: 18 })
	.add('Blighted anglerfish', [5, 6], 1)
	.add('Blighted karambwan', [5, 6], 1)
	.add('Blighted super restore(3)', [3, 4], 1)
	.add('Blighted super restore(4)', [3, 4], 1)
	.add('Ranging potion(2)', [2, 3], 1)
	.add('Super combat potion(2)', [2, 3], 1);

const VenenatisTable = new LootTable()
	/* Unique table */
	.every(VenenatisUniqueTable)

	/* Weapons and armour */
	.add('Rune pickaxe', 5, 8)
	.add('Rune knife', 150, 5)
	.add('Rune dart', 150, 3)
	.add('Mystic air staff', 4, 2)
	.add('Rune platelegs', 4, 2)
	.add('Rune sq shield', 4, 2)
	.add('Dragon dagger', 6, 2)

	/* Runes and ammunition */
	.add('Chaos rune', 500, 7)
	.add('Death rune', 700, 7)
	.add('Blood rune', 900, 7)
	.add('Diamond bolts (e)', 300, 5)
	.add('Cannonball', 600, 4)

	/* Materials */
	.add('Uncut diamond', 35, 8)
	.add('Gold ore', 675, 6)
	.add('Onyx bolt tips', 150, 5)
	.add('Magic logs', 225, 5)
	.add('Limpwurt root', 100, 5)
	.add("Red spiders' eggs", 500, 3)
	.add('Uncut dragonstone', 5, 2)
	.add('Uncut ruby', 75, 1)
	.add('Unicorn horn', 225, 1)
	.add('Grimy ranarr weed', 45, 1)
	.add('Grimy snapdragon', 150, 1)
	.add('Grimy toadflax', 45, 1)

	/* Other */
	.add('Coins', 50_000, 10)
	.add('Super restore(4)', 10, 5)
	.add('Dark crab', 50, 5)
	.add('Supercompost', 225, 4)
	.add('Antidote++(4)', 20, 3)
	.add('Wilderness crabs teleport', 4, 3)
	.add('Blighted anglerfish', 100, 1)

	/* Tertiary */
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(400, 'Long bone')
	.tertiary(1500, 'Venenatis spiderling')
	.tertiary(5013, 'Curved bone');

const VenenatisTotalTable = new LootTable().every(VenenatisSecondarySupplyTable).every(VenenatisTable);

export default new SimpleMonster({
	id: 6610,
	name: 'Venenatis',
	table: VenenatisTotalTable,
	aliases: ['ven', 'venny', 'venenatis', 'vene']
});
