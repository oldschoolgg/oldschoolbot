import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const KrakenTable = new LootTable()
	/* Weapons and armour */
	.add('Mystic water staff', 1, 3)
	.add('Rune warhammer', 1, 2)
	.add('Rune longsword', 1, 2)
	.add('Mystic robe top', 1, 1)
	.add('Mystic robe bottom', 1, 1)
	.oneIn(512, 'Trident of the seas (full)')

	/* Runes */
	.add('Water rune', 400, 10)
	.add('Chaos rune', 250, 10)
	.add('Death rune', 150, 10)
	.add('Blood rune', 60, 10)
	.add('Soul rune', 50, 7)
	.add('Mist rune', 100, 4)

	/* Seeds */
	.add('Watermelon seed', 24, 3)
	.add('Torstol seed', 2, 1)
	.add('Magic seed', 1, 1)

	/* Materials */
	.add('Battlestaff', 10, 4)
	.add('Seaweed', 125, 3)
	.add('Oak plank', 60, 3)
	.add('Unpowered orb', 50, 2)
	.add('Raw shark', 50, 2)
	.add('Raw monkfish', 100, 2)
	.add('Grimy snapdragon', 6, 2)
	.add('Diamond', 8, 1)
	.add('Runite bar', 2, 1)

	/* Other */
	.add('Coins', [10_000, 19_999], 15)
	.add('Shark', 5, 7)
	.add('Pirate boots', 1, 4)
	.add('Sanfew serum(4)', 2, 4)
	.add('Edible seaweed', 5, 3)
	.add('Antidote++(4)', 2, 2)
	.add('Rusty sword', 2, 1)
	.add('Harpoon', 1, 1)
	.add('Bucket', 1, 1)
	.add('Crystal key', 1, 1)
	.add('Dragonstone ring', 1, 1)
	.oneIn(400, 'Kraken tentacle')

	/* Gem drop table */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(500, 'Clue scroll (elite)')
	.tertiary(1000, 'Jar of dirt')
	.tertiary(3000, 'Pet kraken');

export default new SimpleMonster({
	id: 494,
	name: 'Kraken',
	table: KrakenTable,
	aliases: ['kraken', 'cave kraken boss']
});
