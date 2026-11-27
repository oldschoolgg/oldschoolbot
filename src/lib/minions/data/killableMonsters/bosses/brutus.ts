import { GearStat } from '@oldschoolgg/gear';
import { Time } from '@oldschoolgg/toolkit';
import { itemID, Monsters, resolveItems } from 'oldschooljs';

import { brutusCL } from '@/lib/data/CollectionsExport.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import type { KillableMonster } from '@/lib/minions/types.js';

export const brutusKillables: KillableMonster[] = [
	{
		id: Monsters.Brutus.id,
		name: Monsters.Brutus.name,
		aliases: Monsters.Brutus.aliases,
		table: Monsters.Brutus,
		// Targets ~250 kills/hour off task with max KC/stats, cowbell, charged gear and no food.
		timeToFinish: Time.Second * 25,
		respawnTime: Time.Second * 21.6,
		requiredQuests: [QuestID.TheIdesOfMilk],
		qpRequired: 0,
		difficultyRating: 1,
		canCannon: false,
		notifyDrops: resolveItems(['Beef']),
		uniques: brutusCL,
		defaultAttackStyles: ['attack'],
		customMonsterHP: 58,
		combatXpMultiplier: 2,
		healAmountNeeded: 10,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		itemInBankBoosts: [{ [itemID('Cowbell amulet')]: 15 }]
	},
	{
		id: Monsters.DemonicBrutus.id,
		name: Monsters.DemonicBrutus.name,
		aliases: Monsters.DemonicBrutus.aliases,
		table: Monsters.DemonicBrutus,
		// Targets ~12 kills/hour with max KC/stats, Scythe, rancour and anglerfish, before weekends.
		timeToFinish: Time.Second * 573,
		respawnTime: Time.Second * 21.6,
		requiredQuests: [QuestID.TheIdesOfMilk, QuestID.DesertTreasureII],
		qpRequired: 0,
		difficultyRating: 9,
		canCannon: false,
		notifyDrops: resolveItems(['Beef']),
		uniques: resolveItems(['Brutus slippers', 'Beef']),
		defaultAttackStyles: ['attack'],
		// Demonic Brutus heals for another 487 HP after his initial 750 HP phase.
		customMonsterHP: 1237,
		healAmountNeeded: 300,
		minimumHealAmount: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic, GearStat.AttackRanged],
		levelRequirements: {
			attack: 75,
			strength: 75,
			defence: 75,
			hitpoints: 75,
			prayer: 43
		},
		deathProps: {
			hardness: 0.6,
			steepness: 0.99
		},
		equippedItemBoosts: [
			{
				gearSetup: 'melee',
				items: [
					{ itemID: itemID('Soulreaper axe'), boostPercent: 20 },
					{ itemID: itemID('Noxious halberd'), boostPercent: 15 },
					{ itemID: itemID('Blade of saeldor'), boostPercent: 10 },
					{ itemID: itemID('Abyssal tentacle'), boostPercent: 7 },
					{ itemID: itemID('Abyssal whip'), boostPercent: 5 },
					{ itemID: itemID('Zombie axe'), boostPercent: 3 }
				]
			},
			{
				gearSetup: 'melee',
				items: [
					{ itemID: itemID('Avernic defender'), boostPercent: 5 },
					{ itemID: itemID('Dragon defender'), boostPercent: 3 }
				]
			},
			{
				gearSetup: 'melee',
				items: [
					{ itemID: itemID('Amulet of rancour'), boostPercent: 5 },
					{ itemID: itemID('Amulet of torture'), boostPercent: 3 },
					{ itemID: itemID('Amulet of fury'), boostPercent: 1 }
				]
			}
		],
		degradeableItemUsage: [
			{
				required: false,
				gearSetup: 'melee',
				items: [{ itemID: itemID('Scythe of vitur'), boostPercent: 25 }]
			}
		]
	}
];
