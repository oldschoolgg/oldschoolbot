import { LootTable } from 'oldschooljs';

const TalismanTable = new LootTable()
	.add('Mind talisman', 1, 4)
	.add('Body talisman', 1, 4)
	.add('Chaos talisman', 1, 4)
	.add('Cosmic talisman', 1, 4)
	.add('Nature talisman', 1, 4)
	.add('Air talisman', 1, 3)
	.add('Water talisman', 1, 3)
	.add('Earth talisman', 1, 3)
	.add('Fire talisman', 1, 3)
	.add('Elemental talisman', 1, 1)
	.add('Law talisman', 1, 1)
	.add('Death talisman', 1, 1);

const AbyssalDyeTable = new LootTable().add('Abyssal red dye').add('Abyssal green dye').add('Abyssal blue dye');

const RareRewardTable = new LootTable()
	.oneIn(200, 'Catalytic talisman')
	.oneIn(300, 'Abyssal needle')
	.oneIn(700, 'Abyssal lantern')
	.oneIn(400, AbyssalDyeTable);

export const rewardsGuardianTable = new LootTable()
	.every(RareRewardTable)

	/* Runes */
	.add('Chaos rune', [61, 150], 10)
	.add('Cosmic rune', [20, 30], 10)
	.add('Nature rune', [28, 150], 10)
	.add('Law rune', [9, 120], 10)
	.add('Death rune', [5, 120], 10)
	.add('Blood rune', [5, 120], 10)
	.add('Air rune', [400, 500], 4)
	.add('Water rune', [400, 500], 4)
	.add('Earth rune', [400, 500], 4)
	.add('Fire rune', [400, 500], 4)
	.add('Mind rune', [250, 400], 4)
	.add('Body rune', [80, 150], 4)

	/* Talismans */
	.add(TalismanTable, 1, 16)

	/* Other */
	.add('Abyssal pearls', [10, 20], 18)
	.add('Intricate pouch', 1, 5)
	.add('Abyssal ashes', 1, 1)
	.add('Needle', 1, 1)

	/* Tertiary */
	// Atlax moved here to not mess with rate but still drop for the sake of it.
	.tertiary(20, "Atlax's diary")
	.tertiary(4000, 'Abyssal protector');
