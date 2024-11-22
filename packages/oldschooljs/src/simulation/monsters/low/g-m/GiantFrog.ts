import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 477,
	name: 'Giant frog',
	table: new LootTable({ limit: 128 })
		.every('Big bones')
		.tertiary(64, 'Clue scroll (beginner)')
		.tertiary(400, 'Long bone')
		.tertiary(5013, 'Curved bone')

		.add('Mithril spear', 1, 2)
		.add('Nature rune', 1, 10)
		.add('Nature rune', 3, 10)
		.add('Nature rune', 9, 10)
		.add('Cosmic rune', 5, 3)
		.add('Iron arrow', 22, 2)
		.add('Blood rune', 1, 1)
		.add('Steel arrow', 45, 1)
		.add('Giant frog legs', 1, 64)
		.add('Coins', 30, 10)
		.add('Coins', 2, 8)
		.add('Coins', 37, 5)
		.add('Coal', 1, 1)
		.add('Spinach roll', 1, 1),
	aliases: ['giant frog']
});
