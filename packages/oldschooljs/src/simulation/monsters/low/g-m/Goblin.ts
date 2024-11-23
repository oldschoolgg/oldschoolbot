import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const GoblinTable = new LootTable({ limit: 128 })
	.every('Bones')
	.tertiary(35, 'Ensouled goblin head')
	.tertiary(64, 'Clue scroll (beginner)')
	.tertiary(128, 'Clue scroll (easy)')
	.tertiary(5000, 'Goblin champion scroll')

	/* Weapons and armour */
	.add('Bronze spear', 1, 4)
	.add('Bronze sq shield', 1, 3)

	/* Runes and ammunition */
	.add('Water rune', 6, 6)
	.add('Body rune', 7, 5)
	.add('Earth rune', 4, 3)
	.add('Bronze bolts', 8, 3)

	/* Coins */
	.add('Coins', 5, 28)
	.add('Coins', 9, 3)
	.add('Coins', 15, 3)
	.add('Coins', 20, 2)
	.add('Coins', 1, 1)

	/* Other */
	.add('Hammer', 1, 15)
	.add('Goblin mail', 1, 5)
	.add("Chef's hat", 1, 3)
	.add('Goblin book', 1, 2)
	.add('Beer', 1, 2)
	.add('Brass necklace', 1, 1)
	.add('Air talisman', 1, 1);

export default new SimpleMonster({
	id: 655,
	name: 'Goblin',
	table: GoblinTable,
	aliases: ['goblin']
});
