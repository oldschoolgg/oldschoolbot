import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { BitField } from '../../../../../constants';
import { GearStat } from '../../../../../gear';
import { addStatsOfItemsTogether } from '../../../../../structures/Gear';
import itemID from '../../../../../util/itemID';
import resolveItems from '../../../../../util/resolveItems';
import { CustomMonster } from '../customMonsters';

export const VenatrixLootTable = new LootTable()
	.every('Venatrix eggs')
	.every(
		new LootTable()
			.add('Magic logs', [200, 250])
			.add('Mahogany logs', 80)
			.add('Dragon bones', [15, 20])
			.add('Runite ore', [8, 10])
	)
	.tertiary(2, "Red spiders' eggs", [200, 600])
	.tertiary(300, 'Venatrix webbing')
	.tertiary(300, 'Spiders leg bottom')
	.tertiary(100, 'Elder scroll piece');

export const Venatrix: CustomMonster = {
	id: 93_183,
	baseMonster: Monsters.AbyssalSire,
	name: 'Venatrix',
	aliases: ['venatrix'],
	timeToFinish: Time.Minute * 20,
	hp: 3330,
	table: VenatrixLootTable,
	difficultyRating: 5,
	qpRequired: 500,
	healAmountNeeded: 200 * 10,
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
	minimumFoodHealAmount: 22,
	allItems: resolveItems([]),
	minimumGearRequirements: {
		melee: {}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Soulreaper axe']), [GearStat.AttackSlash])
	},
	itemCost: {
		itemCost: new Bank().add('Anti-venom+(4)').add('Sanfew serum(4)').add('Saradomin brew (4)', 1),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems([]),
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
	requiredBitfield: BitField.HasUnlockedVenatrix,
	kcRequirements: {
		Celestara: 1
	}
};
