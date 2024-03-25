/**
 * - Enrage mechanic
 * - Food/pots ?
 *
 *
 *
 */
import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { GearStat } from '../../../../../gear';
import { DragonTable } from '../../../../../simulation/grandmasterClue';
import { runeAlchablesTable, UncutGemTable } from '../../../../../simulation/sharedTables';
import { addStatsOfItemsTogether } from '../../../../../structures/Gear';
import itemID from '../../../../../util/itemID';
import resolveItems from '../../../../../util/resolveItems';
import { CustomMonster } from '../customMonsters';

export const AraxxorLootTable = new LootTable()
	.every(
		new LootTable().add(UncutGemTable).add('Royal dragonhide', [10, 20]).add(runeAlchablesTable).add(DragonTable),
		[3, 5]
	)
	.tertiary(100, 'Baby araxxor')
	.tertiary(100, 'Spiders leg bottom')
	.tertiary(100, 'Elder scroll piece');

export const Araxxor: CustomMonster = {
	id: 93_183,
	baseMonster: Monsters.AbyssalSire,
	name: 'Araxxor',
	aliases: ['araxxor'],
	timeToFinish: Time.Minute * 20,
	hp: 3330,
	table: AraxxorLootTable,
	difficultyRating: 5,
	qpRequired: 500,
	healAmountNeeded: 250 * 200,
	attackStyleToUse: GearStat.AttackSlash,
	attackStylesUsed: [GearStat.AttackSlash],
	levelRequirements: {
		hitpoints: 100,
		attack: 100,
		strength: 100,
		defence: 100,
		magic: 100,
		ranged: 100,
		slayer: 100
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
		itemCost: new Bank().add('Anti-venom+(4)').add('Sanfew serum(4)').add('Enhanced saradomin brew', 1),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems(['Sundial scimitar']),
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
	]
};
