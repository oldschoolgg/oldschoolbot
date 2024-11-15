import { CommonSeedDropTable, GemTable, HerbDropTable, LootTable } from 'oldschooljs';

export const CyclopsTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Black knife', [4, 13], 16)
	.add('Steel chainbody', 1, 2)
	.add('Iron 2h sword', 1, 2)
	.add('Iron chainbody', 1, 2)
	.add('Steel dagger', 1, 2)
	.add('Steel mace', 1, 2)
	.add('Steel sword', 1, 2)
	.add('Steel battleaxe', 1, 2)
	.add('Steel 2h sword', 1, 2)
	.add('Steel longsword', 1, 2)
	.add('Steel med helm', 1, 2)
	.add('Black 2h sword', 1, 1)
	.add('Mithril dagger', 1, 1)
	.add('Adamant mace', 1, 1)
	.add('Black sword', 1, 1)
	.add('Black longsword', 1, 1)
	.add('Black dagger', 1, 1)
	.add('Adamant 2h sword', 1, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 3)

	/* Seeds */
	.add(CommonSeedDropTable, 1, 1)

	/* Coins */
	.add('Coins', [3, 102], 31)
	.add('Coins', [5, 204], 10)

	/* Gem drop table */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(400, 'Long bone')
	.tertiary(512, 'Clue scroll (hard)')
	.tertiary(5013, 'Curved bone');
