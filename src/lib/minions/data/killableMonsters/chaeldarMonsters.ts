import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';
import {SkillsEnum} from "../../../skilling/types";

export const chaeldarMonsters: KillableMonster[] = [
	{
		id: Monsters.AncientZygomite.id,
		name: Monsters.AncientZygomite.name,
		aliases: Monsters.AncientZygomite.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.AncientZygomite,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Fungicide spray 10']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 57
		}
	},
	{
		id: Monsters.Aviansie.id,
		name: Monsters.Aviansie.name,
		aliases: Monsters.Aviansie.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.Aviansie,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		qpRequired: 0,
		levelRequirements: {
			agility: 60
		},
		defaultAttackStyles: [SkillsEnum.Ranged],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Magic]
	},
	{
		id: Monsters.BlackDemon.id,
		name: Monsters.BlackDemon.name,
		aliases: Monsters.BlackDemon.aliases,
		timeToFinish: Time.Second * 34,
		table: Monsters.BlackDemon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		existsInCatacombs: true,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10
			},
			{
				[itemID('Saradomin godsword')]: 5
			}
		]
	},
	{
		id: Monsters.CaveHorror.id,
		name: Monsters.CaveHorror.name,
		aliases: Monsters.CaveHorror.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.CaveHorror,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([
			'Witchwood icon',
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		qpRequired: 20,
		levelRequirements: {
			slayer: 58
		},
		superior: Monsters.CaveAbomination
	},
	{
		id: Monsters.CaveKraken.id,
		name: Monsters.CaveKraken.name,
		aliases: Monsters.CaveKraken.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.CaveKraken,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		qpRequired: 0,
		levelRequirements: {
			slayer: 87
		},
		slayerOnly: true,
		defaultAttackStyles: [SkillsEnum.Magic],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Ranged]
	},
	{
		id: Monsters.FossilIslandWyvernAncient.id,
		name: Monsters.FossilIslandWyvernAncient.name,
		aliases: Monsters.FossilIslandWyvernAncient.aliases,
		timeToFinish: Time.Second * 130,
		table: Monsters.FossilIslandWyvernAncient,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 82
		}
	},
	{
		id: Monsters.FossilIslandWyvernLongTailed.id,
		name: Monsters.FossilIslandWyvernLongTailed.name,
		aliases: Monsters.FossilIslandWyvernLongTailed.aliases,
		timeToFinish: Time.Second * 73,
		table: Monsters.FossilIslandWyvernLongTailed,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 66
		}
	},
	{
		id: Monsters.FossilIslandWyvernSpitting.id,
		name: Monsters.FossilIslandWyvernSpitting.name,
		aliases: Monsters.FossilIslandWyvernSpitting.aliases,
		timeToFinish: Time.Second * 73,
		table: Monsters.FossilIslandWyvernSpitting,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 66
		}
	},
	{
		id: Monsters.FossilIslandWyvernTaloned.id,
		name: Monsters.FossilIslandWyvernTaloned.name,
		aliases: Monsters.FossilIslandWyvernTaloned.aliases,
		timeToFinish: Time.Second * 73,
		table: Monsters.FossilIslandWyvernTaloned,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		qpRequired: 2,
		levelRequirements: {
			slayer: 66
		}
	},
	{
		id: Monsters.GreaterDemon.id,
		name: Monsters.GreaterDemon.name,
		aliases: Monsters.GreaterDemon.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.GreaterDemon,

		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 12
			},
			{
				[itemID('Saradomin godsword')]: 3
			}
		]
	},
	{
		id: Monsters.IronDragon.id,
		name: Monsters.IronDragon.name,
		aliases: Monsters.IronDragon.aliases,
		timeToFinish: Time.Second * 46,
		table: Monsters.IronDragon,

		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0
	},
	{
		id: Monsters.Kraken.id,
		name: Monsters.Kraken.name,
		aliases: Monsters.Kraken.aliases,
		timeToFinish: Time.Second * 90,
		table: Monsters.Kraken,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			['Trident of the seas', 'Trident of the seas (full)', 'Uncharged trident']
		]),
		notifyDrops: resolveItems(['Jar of sand', 'Pet kraken']),
		itemInBankBoosts: [
			{
				[itemID('Uncharged trident')]: 5,
				[itemID('Trident of the seas')]: 5,
				[itemID('Trident of the seas (full)')]: 8,
				[itemID('Sanguinesti staff')]: 11,
				[itemID('Harmonised nightmare staff')]: 15
			}
		],
		qpRequired: 0,
		levelRequirements: {
			slayer: 87
		},
		defaultAttackStyles: [SkillsEnum.Magic],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Ranged],
		slayerOnly: true
	},
	{
		id: Monsters.Lizardman.id,
		name: Monsters.Lizardman.name,
		aliases: Monsters.Lizardman.aliases,
		timeToFinish: Time.Second * 11,
		table: Monsters.Lizardman,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 30
	},
	{
		id: Monsters.LizardmanBrute.id,
		name: Monsters.LizardmanBrute.name,
		aliases: Monsters.LizardmanBrute.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.LizardmanBrute,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 30
	},
	{
		id: Monsters.LizardmanShaman.id,
		name: Monsters.LizardmanShaman.name,
		aliases: Monsters.LizardmanShaman.aliases,
		timeToFinish: Time.Minute * 52,
		table: Monsters.LizardmanShaman,
		emoji: '<:Dragon_warhammer:405998717154623488>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			["Karil's crossbow", 'Rune crossbow', 'Armadyl crossbow']
		]),
		notifyDrops: resolveItems(['Dragon warhammer']),
		qpRequired: 30,
		itemInBankBoosts: [
			{
				[itemID('Ring of the gods')]: 3
			}
		],
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Porazdir.id,
		name: Monsters.Porazdir.name,
		aliases: Monsters.Porazdir.aliases,
		timeToFinish: Time.Minute * 13,
		table: Monsters.Porazdir,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			[
				'Zamorak staff',
				'Staff of the dead',
				'Toxic staff (uncharged)',
				'Toxic staff of the dead'
			]
		]),
		qpRequired: 0
	},
	{
		id: Monsters.SkeletalWyvern.id,
		name: Monsters.SkeletalWyvern.name,
		aliases: Monsters.SkeletalWyvern.aliases,
		timeToFinish: Time.Second * 80,
		table: Monsters.SkeletalWyvern,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 72
		}
	},
	{
		id: Monsters.Skotizo.id,
		name: Monsters.Skotizo.name,
		aliases: Monsters.Skotizo.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.Skotizo,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 0,
		itemsRequired: resolveItems(['Dark totem']),
		notifyDrops: resolveItems(['Jar of darkness', 'Skotos']),
		qpRequired: 0,
		// Skotizo requires 1 totem per kill, and arclight makes kill 2x faster irl.
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 50
			}
		]
	},
	{
		id: Monsters.TzHaarKet.id,
		name: Monsters.TzHaarKet.name,
		aliases: Monsters.TzHaarKet.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.TzHaarKet,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.Wyrm.id,
		name: Monsters.Wyrm.name,
		aliases: Monsters.Wyrm.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.Wyrm,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots']
		]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 62
		},
		superior: Monsters.ShadowWyrm
	},
	{
		id: Monsters.Zygomite.id,
		name: Monsters.Zygomite.name,
		aliases: Monsters.Zygomite.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Zygomite,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems(['Fungicide spray 10']),
		qpRequired: 3,
		levelRequirements: {
			slayer: 57
		}
	}
];
