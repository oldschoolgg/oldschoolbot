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

import { MysteryBoxes } from '../../../../../bsoOpenables';
import { GearStat } from '../../../../../gear';
import { DragonTable } from '../../../../../simulation/grandmasterClue';
import { runeAlchablesTable, UncutGemTable } from '../../../../../simulation/sharedTables';
import { addStatsOfItemsTogether } from '../../../../../structures/Gear';
import itemID from '../../../../../util/itemID';
import resolveItems from '../../../../../util/resolveItems';
import { CustomMonster } from '../customMonsters';

export const AkumuLootTable = new LootTable()
	.every(
		new LootTable().add(UncutGemTable).add('Royal dragonhide', [10, 20]).add(runeAlchablesTable).add(DragonTable),
		[3, 5]
	)
	.tertiary(120, 'Elder clue scroll')
	.tertiary(100, MysteryBoxes);

export const Akumu: CustomMonster = {
	id: 93_135,
	baseMonster: Monsters.AbyssalSire,
	name: 'Akumu',
	aliases: ['akumu'],
	timeToFinish: Time.Minute * 100,
	hp: 3330,
	table: AkumuLootTable,
	difficultyRating: 5,
	qpRequired: 1500,
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
	allItems: resolveItems(['Lunite', 'Moonlight essence', 'Moondash charm', 'Noom']),
	minimumGearRequirements: {
		melee: {}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Soulreaper axe']), [GearStat.AttackSlash])
	},
	itemCost: {
		itemCost: new Bank()
			.add('Super combat potion(4)')
			.add('Enhanced saradomin brew', 3)
			.add('Enhanced super restore'),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems(["Combatant's cape"]),
	customRequirement: async user => {
		const tames = await user.fetchTames();
		const hasMaxedIgne = tames.some(tame => tame.isMaxedIgneTame());
		if (hasMaxedIgne) return null;
		return 'You need to have a maxed Igne Tame (best gear, all fed items) to fight Celestara.';
	},
	setupsUsed: ['melee'],
	equippedItemBoosts: [
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 25,
					itemID: itemID('Axe of the high sungod')
				}
			]
		}
	]
};
