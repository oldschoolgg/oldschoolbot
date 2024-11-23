import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const BrineRatTable = new LootTable({ limit: 128 })
	.every('Bones')
	.every('Raw rat meat')

	/* Weapons */
	.oneIn(512, 'Brine sabre')

	/* Runes */
	.add('Death rune', 7, 18)
	.add('Earth rune', 10, 6)
	.add('Earth rune', 36, 4)
	.add('Water rune', 10, 3)
	.add('Air rune', 18, 2)
	.add('Earth rune', 18, 2)
	.add('Water rune', 18, 2)
	.add('Blood rune', 4, 2)

	/* Materials */
	.add('Raw lobster', 10, 6)
	.add('Raw shark', 3, 6)
	.add('Raw rat meat', 18, 2)
	.add('Raw pike', 18, 2)
	.add('Raw shark', 8, 2)
	.add('Raw swordfish', 9, 2)
	.add('Raw shark', 1, 1)

	/* Coins */
	.add('Coins', 1, 21)
	.add('Coins', 2, 16)
	.add('Coins', 4, 9)
	.add('Coins', 29, 3)

	/* Other */
	.add('Water talisman', 1, 3)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 4501,
	name: 'Brine Rat',
	table: BrineRatTable,
	aliases: ['brine rat', 'brine']
});
