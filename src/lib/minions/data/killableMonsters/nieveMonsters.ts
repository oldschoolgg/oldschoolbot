import { Time } from '@oldschoolgg/toolkit/datetime';
import { deepResolveItems, itemID, Monsters, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { QuestID } from '@/lib/minions/data/quests.js';
import type { KillableMonster } from '@/lib/minions/types.js';

export const nieveMonsters: KillableMonster[] = [
	{
		id: Monsters.BabyBlackDragon.id,
		name: Monsters.BabyBlackDragon.name,
		aliases: Monsters.BabyBlackDragon.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.BabyBlackDragon,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.BlackDragon.id,
		name: Monsters.BlackDragon.name,
		aliases: Monsters.BlackDragon.aliases,
		timeToFinish: Time.Second * 76,
		table: Monsters.BlackDragon,

		wildy: true,

		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		healAmountNeeded: 20 * 2,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 2,
		pkBaseDeathChance: 7,
		revsWeaponBoost: true,
		wildySlayerCave: true
	},
	{
		id: Monsters.BrutalBlackDragon.id,
		name: Monsters.BrutalBlackDragon.name,
		aliases: Monsters.BrutalBlackDragon.aliases,
		timeToFinish: Time.Second * 165,
		table: Monsters.BrutalBlackDragon,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Anti-dragon shield', 'Dragonfire shield', 'Dragonfire ward'],
			['Rune crossbow', "Karil's crossbow", 'Armadyl crossbow'],
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		levelRequirements: {
			prayer: 43,
			slayer: 77
		},
		healAmountNeeded: 20 * 4,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.ElderCustodianStalker.id,
		name: Monsters.ElderCustodianStalker.name,
		aliases: Monsters.ElderCustodianStalker.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.ElderCustodianStalker,
		wildy: false,
		existsInCatacombs: false,
		difficultyRating: 3,
		notifyDrops: resolveItems(['Antler guard']),
		qpRequired: 77,
		levelRequirements: {
			slayer: 76
		},
		requiredQuests: [QuestID.ShadowsOfCustodia],
		healAmountNeeded: 38,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic],
		superior: Monsters.AncientCustodian,
		canCannon: true,
		cannonMulti: true,
		canBarrage: true
	},
	{
		id: Monsters.JuvenileCustodianStalker.id,
		name: Monsters.JuvenileCustodianStalker.name,
		aliases: Monsters.JuvenileCustodianStalker.aliases,
		timeToFinish: Time.Second * 32,
		table: Monsters.JuvenileCustodianStalker,
		wildy: false,
		existsInCatacombs: false,
		difficultyRating: 2,
		qpRequired: 77,
		levelRequirements: {
			slayer: 54
		},
		requiredQuests: [QuestID.ShadowsOfCustodia],
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic],
		superior: Monsters.AncientCustodian,
		canCannon: true,
		cannonMulti: true,
		canBarrage: true
	},
	{
		id: Monsters.LocustRider.id,
		name: Monsters.LocustRider.name,
		aliases: Monsters.LocustRider.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.LocustRider,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		healAmountNeeded: 21,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.MatureCustodianStalker.id,
		name: Monsters.MatureCustodianStalker.name,
		aliases: Monsters.MatureCustodianStalker.aliases,
		timeToFinish: Time.Second * 48,
		table: Monsters.MatureCustodianStalker,
		wildy: false,
		existsInCatacombs: false,
		difficultyRating: 2,
		notifyDrops: resolveItems(['Antler guard']),
		qpRequired: 77,
		levelRequirements: {
			slayer: 67
		},
		requiredQuests: [QuestID.ShadowsOfCustodia],
		healAmountNeeded: 28,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic],
		superior: Monsters.AncientCustodian,
		canCannon: true,
		cannonMulti: true,
		canBarrage: true
	},
	{
		id: Monsters.ScarabMage.id,
		name: Monsters.ScarabMage.name,
		aliases: Monsters.ScarabMage.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.ScarabMage,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.SteelDragon.id,
		name: Monsters.SteelDragon.name,
		aliases: Monsters.SteelDragon.aliases,
		timeToFinish: Time.Second * 63,
		table: Monsters.SteelDragon,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 45,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Suqah.id,
		name: Monsters.Suqah.name,
		aliases: Monsters.Suqah.aliases,
		timeToFinish: Time.Second * 23,
		table: Monsters.Suqah,
		wildy: false,

		difficultyRating: 3,
		degradeableItemUsage: [
			{
				required: false,
				gearSetup: 'range',
				items: [
					{
						itemID: itemID('Venator bow'),
						boostPercent: 10
					}
				]
			}
		],
		qpRequired: 0,
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	}
];
