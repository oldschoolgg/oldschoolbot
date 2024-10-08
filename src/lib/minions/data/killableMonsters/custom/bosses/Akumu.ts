import { Time } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';

import { MysteryBoxes } from '../../../../../bsoOpenables';
import { GearStat } from '../../../../../gear';
import { UncutGemTable } from '../../../../../simulation/sharedTables';
import itemID from '../../../../../util/itemID';
import resolveItems from '../../../../../util/resolveItems';
import type { CustomMonster } from '../customMonsters';

export const AkumuLootTable = new LootTable()
	.tertiary(1000, 'Mini akumu')
	.every('Nightmarish ashes', [5, 10])
	.tertiary(4, 'Cursed onyx')
	.tertiary(22, 'Demon statuette')
	.tertiary(100, 'Elder scroll piece')
	.add(
		new LootTable()
			.add(MysteryBoxes)
			.add('Battlestaff', [150, 350], 2)
			.add('Black dragonhide', [100, 400], 2)
			.add('Cannonball', [200, 400], 2)
			.add(UncutGemTable, [2, 4], 2)
	);

export const Akumu: CustomMonster = {
	isCustom: true,
	id: 93_135,
	baseMonster: Monsters.AbyssalSire,
	name: 'Akumu',
	aliases: ['akumu'],
	timeToFinish: Time.Minute * 25,
	hp: 3330,
	table: AkumuLootTable,
	difficultyRating: 5,
	healAmountNeeded: 250 * 22,
	attackStyleToUse: GearStat.AttackSlash,
	attackStylesUsed: [GearStat.AttackSlash],
	levelRequirements: {
		hitpoints: 120,
		attack: 120,
		strength: 120,
		defence: 120,
		slayer: 120
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.999,
		lowestDeathChance: 5,
		highestDeathChance: 65
	},
	minimumHealAmount: 22,
	allItems: resolveItems([]),
	minimumGearRequirements: {
		melee: {}
	},
	itemCost: {
		itemCost: new Bank()
			.add('Super combat potion(4)')
			.add('Lumina')
			.add('Saradomin brew (4)', 3)
			.add('Super restore (4)', 1),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems(["Combatant's cape"]),
	setupsUsed: ['melee'],
	equippedItemBoosts: [
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 20,
					itemID: itemID('Axe of the high sungod')
				}
			]
		}
	],
	kcRequirements: {
		Solis: 1
	}
};
