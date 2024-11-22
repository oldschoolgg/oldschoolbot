import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const MasterFarmerTable = new LootTable()
	.add('Potato seed', [1, 4], 1 / 5.6)
	.add('Onion seed', [1, 3], 1 / 7.47)
	.add('Cabbage seed', [1, 3], 1 / 14.3)
	.add('Tomato seed', [1, 2], 1 / 15.6)
	.add('Sweetcorn seed', [1, 2], 1 / 44.8)
	.add('Strawberry seed', 1, 1 / 82.5)
	.add('Watermelon seed', 1, 1 / 187)
	.add('Snape grass seed', 1, 1 / 260)

	// Hops
	.add('Barley seed', [1, 12], 1 / 18)
	.add('Hammerstone seed', [1, 10], 1 / 18)
	.add('Asgarnian seed', [1, 10], 1 / 23.9)
	.add('Jute seed', [1, 10], 1 / 24.1)
	.add('Yanillian seed', [1, 10], 1 / 36.1)
	.add('Krandorian seed', [1, 10], 1 / 76.2)
	.add('Wildblood seed', [1, 3], 1 / 142)

	// Flowers
	.add('Marigold seed', 1, 1 / 21.8)
	.add('Nasturtium seed', 1, 1 / 32.9)
	.add('Rosemary seed', 1, 1 / 50.9)
	.add('Woad seed', 1, 1 / 68.9)
	.add('Limpwurt seed', 1, 1 / 86.3)

	// Bushes
	.add('Redberry seed', 1, 1 / 25.8)
	.add('Cadavaberry seed', 1, 1 / 36.8)
	.add('Dwellberry seed', 1, 1 / 51.5)
	.add('Jangerberry seed', 1, 1 / 129)
	.add('Whiteberry seed', 1, 1 / 355)
	.add('Poison ivy seed', 1, 1 / 937)

	// Herbs
	.add('Guam seed', 1, 1 / 65.1)
	.add('Marrentill seed', 1, 1 / 95.6)
	.add('Tarromin seed', 1, 1 / 140)
	.add('Harralander seed', 1, 1 / 206)
	.add('Ranarr seed', 1, 1 / 302)
	.add('Toadflax seed', 1, 1 / 443)
	.add('Irit seed', 1, 1 / 651)
	.add('Avantoe seed', 1, 1 / 947)
	.add('Kwuarm seed', 1, 1 / 1389)
	.add('Snapdragon seed', 1, 1 / 2083)
	.add('Cadantine seed', 1, 1 / 2976)
	.add('Lantadyme seed', 1, 1 / 4167)
	.add('Dwarf weed seed', 1, 1 / 6944)
	.add('Torstol seed', 1, 1 / 10_417)

	// Special
	.add('Mushroom spore', 1, 1 / 400)
	.add('Belladonna seed', 1, 1 / 667)
	.add('Cactus seed', 1, 1 / 1000)
	.add('Seaweed spore', 1, 1 / 2200)
	.add('Potato cactus seed', 1, 1 / 2200)
	.tertiary(257_211, 'Rocky');

export default new SimpleMonster({
	id: 5730,
	name: 'Master Farmer',
	table: MasterFarmerTable,
	pickpocketTable: MasterFarmerTable,
	aliases: ['master farmer', 'mfarmer']
});
