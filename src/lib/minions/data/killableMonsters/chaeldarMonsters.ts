import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { deepResolveItems, resolveItems } from 'oldschooljs/dist/util/util';
import { GearStat } from '../../../gear/types';
import { SkillsEnum } from '../../../skilling/types';
import type { KillableMonster } from '../../types';
import { QuestID } from '../quests';

export const chaeldarMonsters: KillableMonster[] = [
	{
		id: Monsters.AncientZygomite.id,
		name: Monsters.AncientZygomite.name,
		aliases: Monsters.AncientZygomite.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.AncientZygomite,

		wildy: false,
		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			slayer: 57
		},
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackRanged]
	},
	{
		id: Monsters.Aviansie.id,
		name: Monsters.Aviansie.name,
		aliases: Monsters.Aviansie.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.Aviansie,

		wildy: true,
		difficultyRating: 4,
		qpRequired: 0,
		defaultAttackStyles: [SkillsEnum.Ranged],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Magic],
		healAmountNeeded: 24,
		pkActivityRating: 7,
		pkBaseDeathChance: 10,
		revsWeaponBoost: true
	},
	{
		id: Monsters.BlackDemon.id,
		name: Monsters.BlackDemon.name,
		aliases: Monsters.BlackDemon.aliases,
		timeToFinish: Time.Second * 36,
		table: Monsters.BlackDemon,
		wildy: true,

		difficultyRating: 3,
		existsInCatacombs: true,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10,
				[itemID('Emberlight')]: 15
			},
			{
				[itemID('Saradomin godsword')]: 5
			}
		],
		healAmountNeeded: 30,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		// Even if no multi, can safespot for same effect
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 7,
		pkBaseDeathChance: 9,
		revsWeaponBoost: true,
		wildySlayerCave: true
	},
	{
		id: Monsters.CaveHorror.id,
		name: Monsters.CaveHorror.name,
		aliases: Monsters.CaveHorror.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.CaveHorror,
		wildy: false,

		difficultyRating: 2,
		itemsRequired: deepResolveItems([
			["Karil's leathertop", 'Armadyl chestplate', "Black d'hide body"],
			["Karil's leatherskirt", 'Armadyl chainskirt', "Black d'hide chaps"]
		]),
		qpRequired: 20,
		levelRequirements: {
			slayer: 58
		},
		superior: Monsters.CaveAbomination,
		healAmountNeeded: 11,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.CaveKraken.id,
		name: Monsters.CaveKraken.name,
		aliases: Monsters.CaveKraken.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.CaveKraken,
		wildy: false,

		difficultyRating: 4,
		qpRequired: 0,
		levelRequirements: {
			slayer: 87
		},
		slayerOnly: true,
		defaultAttackStyles: [SkillsEnum.Magic],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Ranged],
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.FossilIslandWyvernAncient.id,
		name: Monsters.FossilIslandWyvernAncient.name,
		aliases: Monsters.FossilIslandWyvernAncient.aliases,
		timeToFinish: Time.Second * 117,
		table: Monsters.FossilIslandWyvernAncient,
		wildy: false,

		notifyDrops: resolveItems(['Wyvern visage']),

		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			['Elemental shield', 'Mind shield', 'Dragonfire shield', 'Dragonfire ward', 'Ancient wyvern shield']
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 82
		},
		healAmountNeeded: 20 * 4,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.FossilIslandWyvernLongTailed.id,
		name: Monsters.FossilIslandWyvernLongTailed.name,
		aliases: Monsters.FossilIslandWyvernLongTailed.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.FossilIslandWyvernLongTailed,

		wildy: false,

		notifyDrops: resolveItems(['Wyvern visage']),

		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Elemental shield', 'Mind shield', 'Dragonfire shield', 'Dragonfire ward', 'Ancient wyvern shield']
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 66
		},
		healAmountNeeded: 20 * 2,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.FossilIslandWyvernSpitting.id,
		name: Monsters.FossilIslandWyvernSpitting.name,
		aliases: Monsters.FossilIslandWyvernSpitting.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.FossilIslandWyvernSpitting,

		wildy: false,

		notifyDrops: resolveItems(['Wyvern visage']),

		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Elemental shield', 'Mind shield', 'Dragonfire shield', 'Dragonfire ward', 'Ancient wyvern shield']
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 66
		},
		healAmountNeeded: 45,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.FossilIslandWyvernTaloned.id,
		name: Monsters.FossilIslandWyvernTaloned.name,
		aliases: Monsters.FossilIslandWyvernTaloned.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.FossilIslandWyvernTaloned,

		wildy: false,

		notifyDrops: resolveItems(['Wyvern visage']),

		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Elemental shield', 'Mind shield', 'Dragonfire shield', 'Dragonfire ward', 'Ancient wyvern shield']
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 66
		},
		healAmountNeeded: 50,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.GreaterDemon.id,
		name: Monsters.GreaterDemon.name,
		aliases: Monsters.GreaterDemon.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.GreaterDemon,

		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 12,
				[itemID('Emberlight')]: 17
			},
			{
				[itemID('Saradomin godsword')]: 3
			}
		],
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		pkActivityRating: 7,
		pkBaseDeathChance: 9,
		revsWeaponBoost: true,
		wildySlayerCave: true
	},
	{
		id: Monsters.IronDragon.id,
		name: Monsters.IronDragon.name,
		aliases: Monsters.IronDragon.aliases,
		timeToFinish: Time.Second * 92,
		table: Monsters.IronDragon,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		healAmountNeeded: 35,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Kraken.id,
		name: Monsters.Kraken.name,
		aliases: Monsters.Kraken.aliases,
		timeToFinish: Time.Second * 90,
		table: Monsters.Kraken,

		wildy: false,

		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			[
				'Trident of the seas',
				'Trident of the seas (full)',
				'Uncharged trident',
				'Uncharged toxic trident',
				'Trident of the swamp',
				'Sanguinesti staff',
				'Harmonised nightmare staff'
			]
		]),
		notifyDrops: resolveItems(['Jar of sand', 'Pet kraken']),
		itemInBankBoosts: [
			{
				[itemID('Uncharged trident')]: 5,
				[itemID('Trident of the seas')]: 5,
				[itemID('Trident of the seas (full)')]: 8,
				[itemID('Uncharged toxic trident')]: 10,
				[itemID('Trident of the swamp')]: 10,
				[itemID('Sanguinesti staff')]: 12,
				[itemID('Harmonised nightmare staff')]: 15,
				[itemID("Tumeken's shadow")]: 20
			},
			{
				[itemID('Imbued heart')]: 5
			}
		],
		qpRequired: 0,
		levelRequirements: {
			slayer: 87
		},
		defaultAttackStyles: [SkillsEnum.Magic],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Ranged],
		slayerOnly: true,
		healAmountNeeded: 20 * 7,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.Lizardman.id,
		name: Monsters.Lizardman.name,
		aliases: Monsters.Lizardman.aliases,
		timeToFinish: Time.Second * 13,
		table: Monsters.Lizardman,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,

		difficultyRating: 3,
		qpRequired: 30,
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.LizardmanBrute.id,
		name: Monsters.LizardmanBrute.name,
		aliases: Monsters.LizardmanBrute.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.LizardmanBrute,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,

		difficultyRating: 3,
		qpRequired: 30,
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.LizardmanShaman.id,
		name: Monsters.LizardmanShaman.name,
		aliases: Monsters.LizardmanShaman.aliases,
		timeToFinish: Time.Second * 52,
		table: Monsters.LizardmanShaman,
		emoji: '<:Dragon_warhammer:405998717154623488>',
		wildy: false,

		difficultyRating: 6,
		itemsRequired: deepResolveItems([["Karil's crossbow", 'Rune crossbow', 'Armadyl crossbow', 'Toxic blowpipe']]),
		notifyDrops: resolveItems(['Dragon warhammer']),
		qpRequired: 30,
		itemInBankBoosts: [
			{
				[itemID('Ring of the gods')]: 3,
				[itemID('Ring of the gods (i)')]: 5
			},
			{
				[itemID('Toxic blowpipe')]: 15,
				[itemID('Armadyl crossbow')]: 8
			},
			{
				[itemID('Shayzien helm (5)')]: 2
			}
		],
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 20 * 2,
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Magic],
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.SkeletalWyvern.id,
		name: Monsters.SkeletalWyvern.name,
		aliases: Monsters.SkeletalWyvern.aliases,
		timeToFinish: Time.Second * 84,
		table: Monsters.SkeletalWyvern,

		wildy: false,

		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Elemental shield', 'Mind shield', 'Dragonfire shield', 'Dragonfire ward', 'Ancient wyvern shield']
		]),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 72
		},
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged]
	},
	{
		id: Monsters.Skotizo.id,
		name: Monsters.Skotizo.name,
		aliases: Monsters.Skotizo.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.Skotizo,

		wildy: false,

		difficultyRating: 0,
		notifyDrops: resolveItems(['Jar of darkness', 'Skotos']),
		qpRequired: 0,
		// Skotizo requires 1 totem per kill, and arclight makes kill 2x faster irl.
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 50,
				[itemID('Emberlight')]: 55
			}
		],
		itemCost: { itemCost: new Bank().add('Dark totem', 1), qtyPerKill: 1 },
		healAmountNeeded: 20 * 15,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic]
	},
	{
		id: Monsters.TzHaarKet.id,
		name: Monsters.TzHaarKet.name,
		aliases: Monsters.TzHaarKet.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.TzHaarKet,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		canBarrage: true
	},
	{
		id: Monsters.Wyrm.id,
		name: Monsters.Wyrm.name,
		aliases: Monsters.Wyrm.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.Wyrm,

		wildy: false,

		difficultyRating: 3,
		itemsRequired: resolveItems(['Boots of stone']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 62
		},
		superior: Monsters.ShadowWyrm,
		healAmountNeeded: 15,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic]
	},
	{
		id: Monsters.Zygomite.id,
		name: Monsters.Zygomite.name,
		aliases: Monsters.Zygomite.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.Zygomite,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 3,
		levelRequirements: {
			slayer: 57
		},
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.TormentedDemon.id,
		name: Monsters.TormentedDemon.name,
		aliases: Monsters.TormentedDemon.aliases,
		timeToFinish: Time.Second * 166,
		table: Monsters.TormentedDemon,

		wildy: false,

		difficultyRating: 6,
		qpRequired: 0,

		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 20,
				[itemID('Emberlight')]: 25
			},
			{
				[itemID('Ferocious Gloves')]: 6
			},
			{
				[itemID('Burning claws')]: 5
			},
			{
				[itemID('Scorching bow')]: 10,
				[itemID('Purging staff')]: 10
			},
			{
				[itemID('Light ballista')]: 2,
				[itemID('Heavy ballista')]: 4
			}
		],

		healAmountNeeded: 250,
		attackStyleToUse: GearStat.AttackStab,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackRanged, GearStat.AttackMagic],
		requiredQuests: [QuestID.WhileGuthixSleeps],
		itemCost: [
			{
				itemCost: new Bank().add('Guthixian temple teleport'),
				qtyPerKill: 0.05,
				boostPercent: 10,
				optional: true
			}
		]
	}
];
