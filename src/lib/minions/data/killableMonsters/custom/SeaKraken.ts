import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import setCustomMonster from '../../../../util/setCustomMonster';

export const FishTable = new LootTable()
	.add('Raw sea turtle', [1, 10])
	.add('Raw dark crab', [1, 10])
	.add('Raw anglerfish', [1, 20])
	.add('Raw shark', [1, 30])
	.add('Raw monkfish', [1, 40])
	.add('Raw karambwan', [1, 40])
	.add('Raw swordfish', [1, 50])
	.add('Raw bass', [1, 60])
	.add('Raw lobster', [1, 70])
	.add('Raw trout', [1, 80])
	.add('Raw tuna', [1, 90]);

const SeedPackTable = new LootTable()
	.add('Potato seed', [1, 4])
	.add('Onion seed', [1, 3])
	.add('Cabbage seed', [1, 3])
	.add('Tomato seed', [1, 2])
	.add('Sweetcorn seed', [1, 2])
	.add('Strawberry seed', 1)
	.add('Watermelon seed', 1)
	.add('Snape grass seed', 1)

	// Hops
	.add('Barley seed', [1, 12])
	.add('Hammerstone seed', [1, 10])
	.add('Asgarnian seed', [1, 10])
	.add('Jute seed', [1, 10])
	.add('Yanillian seed', [1, 10])
	.add('Krandorian seed', [1, 10])
	.add('Wildblood seed', [1, 3])

	// Flowers
	.add('Marigold seed', 1)
	.add('Nasturtium seed', 1)
	.add('Rosemary seed', 1)
	.add('Woad seed', 1)
	.add('Limpwurt seed', 1)

	// Bushes
	.add('Redberry seed', 1)
	.add('Cadavaberry seed', 1)
	.add('Dwellberry seed', 1)
	.add('Jangerberry seed', 1)
	.add('Whiteberry seed', 1)
	.add('Poison ivy seed', 1)

	// Herbs
	.add('Guam seed', 1)
	.add('Marrentill seed', 1)
	.add('Tarromin seed', 1)
	.add('Harralander seed', 1)
	.add('Ranarr seed', 1)
	.add('Toadflax seed', 1)
	.add('Irit seed', 1)
	.add('Avantoe seed', 1)
	.add('Kwuarm seed', 1)
	.add('Snapdragon seed', 1)
	.add('Cadantine seed', 1)
	.add('Lantadyme seed', 1)
	.add('Dwarf weed seed', 1)
	.add('Torstol seed', 1)

	// Special
	.add('Mushroom spore', 1)
	.add('Belladonna seed', 1)
	.add('Cactus seed', 1)
	.add('Potato cactus seed', 1);

export const KrakenTable = new LootTable()
	.every(FishTable, [1, 3])
	.tertiary(3, SeedPackTable, [1, 4])
	.add('Coins', [50_000, 100_000])
	.add('Clue scroll (master)')
	.add('Clue scroll (elite)')
	.add('Clue scroll (hard)')
	.add('Pirate boots')
	.add('Harpoon')
	.add('Kraken tentacle')
	.add('Crystal key')
	.add('Seaweed')
	.add('Water rune', [20, 500])
	.tertiary(400, 'Fish sack')
	.tertiary(1200, 'Pufferfish')
	.tertiary(100_000, 'Fishing trophy')
	.tertiary(50, 'Clue scroll (grandmaster)');

setCustomMonster(53466534, 'Sea Kraken', KrakenTable, Monsters.CommanderZilyana, {
	id: 53466534,
	name: 'Sea Kraken',
	aliases: ['sea kraken']
});

const SeaKraken = Monsters.find(mon => mon.name === 'Sea Kraken')!;

export default SeaKraken;
