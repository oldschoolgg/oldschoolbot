import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';

export const ZombieTable = new LootTable({ limit: 128 })
	.every('Bones')
	.tertiary(5000, 'Zombie champion scroll')

	/* Weapons and armour */
	.add('Bronze med helm', 1, 4)
	.add('Bronze longsword')
	.add('Iron axe')

	/* Runes and ammunition */
	.add('Iron arrow', 5, 7)
	.add('Body rune', 6, 5)
	.add('Mind rune', 5, 5)
	.add('Air rune', 13, 4)
	.add('Iron arrow', 8, 4)
	.add('Steel arrow', 5, 2)
	.add('Nature rune', 6, 1)

	/* Coins */
	.add('Coins', 10, 11)
	.add('Coins', 4, 4)
	.add('Coins', 18, 3)
	.add('Coins', 13, 2)
	.add('Coins', 28, 2)

	/* Other */
	.add('Fishing bait', 5, 37)
	.add('Copper ore', 1, 2)

	/* Subtables */
	.add(HerbDropTable, 1, 25);

export default new SimpleMonster({
	id: 26,
	name: 'Zombie',
	table: ZombieTable,
	aliases: ['zombie']
});
