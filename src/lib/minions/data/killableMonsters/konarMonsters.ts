import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { GearSetupTypes, GearStat } from '../../../gear';
import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const konarMonsters: KillableMonster[] = [
	{
		id: Monsters.AdamantDragon.id,
		name: Monsters.AdamantDragon.name,
		aliases: Monsters.AdamantDragon.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.AdamantDragon,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 205,
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged]
	},
	{
		id: Monsters.BabyRedDragon.id,
		name: Monsters.BabyRedDragon.name,
		aliases: Monsters.BabyRedDragon.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.BabyRedDragon,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 15,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.BrutalRedDragon.id,
		name: Monsters.BrutalRedDragon.name,
		aliases: Monsters.BrutalRedDragon.aliases,
		timeToFinish: Time.Second * 155,
		table: Monsters.BrutalRedDragon,

		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		healAmountNeeded: 85,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.DarkBeast.id,
		name: Monsters.DarkBeast.name,
		aliases: Monsters.DarkBeast.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.DarkBeast,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		qpRequired: 0,
		levelRequirements: {
			slayer: 90
		},
		superior: Monsters.NightBeast,
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Drake.id,
		name: Monsters.Drake.name,
		aliases: Monsters.Drake.aliases,
		timeToFinish: Time.Second * 54,
		table: Monsters.Drake,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			slayer: 84
		},

		superior: Monsters.GuardianDrake,
		healAmountNeeded: 70,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Hydra.id,
		name: Monsters.Hydra.name,
		aliases: Monsters.Hydra.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.Hydra,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems(['Antidote++(4)']),
		notifyDrops: resolveItems(['Hydra tail']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 95
		},
		superior: Monsters.ColossalHydra,
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged]
	},
	{
		id: Monsters.AlchemicalHydra.id,
		name: Monsters.AlchemicalHydra.name,
		aliases: Monsters.AlchemicalHydra.aliases,
		timeToFinish: Time.Second * 240,
		table: Monsters.AlchemicalHydra,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: deepResolveItems(['Antidote++(4)']),
		notifyDrops: resolveItems([
			'Hydra leather',
			'Hydra tail',
			"Hydra's claw",
			'Ikkle hydra',
			'Jar of chemicals'
		]),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Twisted bow')]: 10
			},
			{
				[itemID('Barrows gloves')]: 3,
				[itemID('Ferocious gloves')]: 6
			},
			{
				[itemID('Saradomin godsword')]: 8,
				[itemID('Dragon claws')]: 10
			}
		],
		slayerOnly: true,
		levelRequirements: {
			slayer: 95
		},
		healAmountNeeded: 20 * 22,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged]
	},
	{
		id: Monsters.MithrilDragon.id,
		name: Monsters.MithrilDragon.name,
		aliases: Monsters.MithrilDragon.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.MithrilDragon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Dragon full helm']),
		qpRequired: 0,
		healAmountNeeded: 85,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged]
	},
	{
		id: Monsters.RedDragon.id,
		name: Monsters.RedDragon.name,
		aliases: Monsters.RedDragon.aliases,
		timeToFinish: Time.Second * 54,
		table: Monsters.RedDragon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		healAmountNeeded: 26,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.RuneDragon.id,
		name: Monsters.RuneDragon.name,
		aliases: Monsters.RuneDragon.aliases,
		timeToFinish: Time.Second * 130,
		table: Monsters.RuneDragon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Dragon metal lump', 'Draconic visage']),
		qpRequired: 205,
		healAmountNeeded: 20 * 6,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged]
	},
	{
		id: Monsters.SmokeDevil.id,
		name: Monsters.SmokeDevil.name,
		aliases: Monsters.SmokeDevil.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.SmokeDevil,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		notifyDrops: resolveItems(['Dragon chainbody']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 93
		},
		slayerOnly: true,
		superior: Monsters.NuclearSmokeDevil,
		itemInBankBoosts: [
			{
				[itemID('Kodai wand')]: 12,
				[itemID('Staff of the dead')]: 8
			}
		],
		healAmountNeeded: 16,
		attackStyleToUse: GearSetupTypes.Mage,
		attackStylesUsed: [GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: true,
		canBarrage: true
	},
	{
		id: Monsters.ThermonuclearSmokeDevil.id,
		name: Monsters.ThermonuclearSmokeDevil.name,
		aliases: Monsters.ThermonuclearSmokeDevil.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.ThermonuclearSmokeDevil,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		notifyDrops: resolveItems(['Dragon chainbody', 'Smoke Battlestaff', 'Pet smoke devil']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 93
		},
		slayerOnly: true,
		itemInBankBoosts: [
			{
				[itemID('Dragon dagger')]: 5,
				[itemID('Dragon claws')]: 10
			},
			{
				[itemID('Harmonised nightmare staff')]: 12,
				[itemID('Trident of the swamp')]: 9,
				[itemID('Uncharged toxic trident')]: 9,
				[itemID('Trident of the seas')]: 7,
				[itemID('Uncharged trident')]: 7
			},
			{
				[itemID('Ancestral robe bottom')]: 2
			},
			{
				[itemID('Ancestral robe top')]: 3
			}
		],
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearSetupTypes.Mage,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.Waterfiend.id,
		name: Monsters.Waterfiend.name,
		aliases: Monsters.Waterfiend.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Waterfiend,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		notifyDrops: resolveItems(['Mist battlestaff']),
		qpRequired: 0,
		healAmountNeeded: 38,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	}
];
