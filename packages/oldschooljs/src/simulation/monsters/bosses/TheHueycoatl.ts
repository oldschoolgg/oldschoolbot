import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';

const TheHueycoatlTable = new LootTable()
	.every('Big bones')
	.tertiary(50, 'Clue scroll (hard)')
	.tertiary(150, 'Tooth half of key (moon key)')
	.tertiary(400 * 3.5, 'Huberte')

	.oneIn(
		23,
		new LootTable()
			.add('Hueycoatl hide', [2, 3], 6)
			.add('Tome of earth (empty)', 1, 3)
			.add('Dragon hunter wand', 1, 1)
	)
	.add('Rune mace', [1, 26], 3)
	.add('Rune scimitar', [1, 20], 3)
	.add('Adamant platebody', [1, 30], 3)
	.add('Rune plateskirt', [1, 20], 2)

	.add('Death rune', [22, 450], 3)
	.add('Earth rune', [150, 3000], 2)
	.add('Cosmic rune', [20, 400], 2)
	.add('Nature rune', [20, 400], 2)

	.add('Avantoe seed', [1, 20], 3)
	.add('Kwuarm seed', [1, 20], 3)
	.add('Lantadyme seed', [3, 60], 2)
	.add('Huasca seed', [1, 20], 2)
	.add('Toadflax seed', [2, 40], 2)
	.add('Torstol seed', [1, 20], 2)
	.add('Ranarr seed', [1, 20], 2)

	.add('Soiled page', [30, 80], 5)
	.add('Adamant bolts(unf)', [15, 300], 3)
	.add('Air orb', [4, 80], 3)
	.add('Raw shark', [9, 180], 3)
	.add('Sunfire splinters', [17, 350], 3)
	.add('Sun-kissed bones', [5, 100], 3)
	.add('Dragon bones', [2, 40], 3)
	.add('Cannonball', [60, 1200], 3)
	.add('Adamantite ore', [6, 120], 2)
	.add('Rune dart tip', [6, 120], 2)
	.add('Limpwurt root', [10, 200], 2);

export const TheHueycoatl = new SimpleMonster({
	id: 14009,
	name: 'The Hueycoatl',
	table: TheHueycoatlTable,
	aliases: ['hueycoatl', 'the hueycoatl']
});