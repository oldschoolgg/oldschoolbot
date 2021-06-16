import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { GearSetupTypes, GearStat } from '../../../gear';
import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const vannakaMonsters: KillableMonster[] = [
	{
		id: Monsters.AberrantSpectre.id,
		name: Monsters.AberrantSpectre.name,
		aliases: Monsters.AberrantSpectre.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.AberrantSpectre,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			slayer: 60
		},

		superior: Monsters.AbhorrentSpectre,
		healAmountNeeded: 25,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.AbyssalDemon.id,
		name: Monsters.AbyssalDemon.name,
		aliases: Monsters.AbyssalDemon.aliases,
		timeToFinish: Time.Second * 26,
		table: Monsters.AbyssalDemon,

		wildy: false,

		difficultyRating: 3,
		notifyDrops: resolveItems(['Abyssal head', 'Abyssal dagger']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 85
		},
		existsInCatacombs: true,
		superior: Monsters.GreaterAbyssalDemon,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10
			},
			{
				[itemID('Saradomin godsword')]: 5
			}
		],
		healAmountNeeded: 35,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab],
		canBarrage: true
	},
	{
		id: Monsters.AbyssalSire.id,
		name: Monsters.AbyssalSire.name,
		aliases: Monsters.AbyssalSire.aliases,
		timeToFinish: Time.Second * 195,
		table: Monsters.AbyssalSire,

		wildy: false,

		difficultyRating: 5,
		qpRequired: 0,
		levelRequirements: {
			slayer: 85
		},
		pohBoosts: {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 10,
				'Ornate rejuvenation pool': 10,
				'Ancient rejuvenation pool': 20
			}
		},
		slayerOnly: true,
		notifyDrops: resolveItems(['Unsired']),
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10
			},
			{
				[itemID('Bandos godsword')]: 5,
				[itemID('Dragon warhammer')]: 10
			}
		],
		healAmountNeeded: 20 * 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab]
	},
	{
		id: Monsters.Ankou.id,
		name: Monsters.Ankou.name,
		aliases: Monsters.Ankou.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Ankou,

		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 15,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		canBarrage: true,
		itemInBankBoosts: [
			{
				[itemID('Kodai wand')]: 12,
				[itemID('Staff of the dead')]: 8
			}
		]
	},
	{
		id: Monsters.BabyBlueDragon.id,
		name: Monsters.BabyBlueDragon.name,
		aliases: Monsters.BabyBlueDragon.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.BabyBlueDragon,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 12,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.BabyGreenDragon.id,
		name: Monsters.BabyGreenDragon.name,
		aliases: Monsters.BabyGreenDragon.aliases,
		timeToFinish: Time.Second * 17,
		table: Monsters.BabyGreenDragon,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 10,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Basilisk.id,
		name: Monsters.Basilisk.name,
		aliases: Monsters.Basilisk.aliases,
		timeToFinish: Time.Second * 38,
		table: Monsters.Basilisk,

		wildy: false,

		difficultyRating: 3,
		notifyDrops: resolveItems(['Basilisk head']),
		qpRequired: 1,
		levelRequirements: {
			slayer: 40
		},
		superior: Monsters.MonstrousBasilisk,
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.BasiliskKnight.id,
		name: Monsters.BasiliskKnight.name,
		aliases: Monsters.BasiliskKnight.aliases,
		timeToFinish: Time.Second * 80,
		table: Monsters.BasiliskKnight,

		wildy: false,

		difficultyRating: 2,
		notifyDrops: resolveItems(['Basilisk head', 'Basilisk jaw']),
		qpRequired: 120,
		levelRequirements: {
			slayer: 60
		},
		superior: Monsters.BasiliskSentinel,
		healAmountNeeded: 20 * 4,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic],
		itemInBankBoosts: [
			{
				[itemID("Inquisitor's mace")]: 10
			},
			{
				[itemID("Inquisitor's hauberk")]: 4
			},
			{
				[itemID("Inquisitor's plateskirt")]: 4
			}
		]
	},
	{
		id: Monsters.Bloodveld.id,
		name: Monsters.Bloodveld.name,
		aliases: Monsters.Bloodveld.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.Bloodveld,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 50
		},
		superior: Monsters.InsatiableBloodveld,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 15
			}
		],
		healAmountNeeded: 28,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic],
		canCannon: true
	},
	{
		id: Monsters.BlueDragon.id,
		name: Monsters.BlueDragon.name,
		aliases: Monsters.BlueDragon.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.BlueDragon,

		wildy: false,

		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		healAmountNeeded: 28,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		combatXpMultiplier: 1.025,
		canCannon: true
	},
	{
		id: Monsters.BrineRat.id,
		name: Monsters.BrineRat.name,
		aliases: Monsters.BrineRat.aliases,
		timeToFinish: Time.Second * 38,
		table: Monsters.BrineRat,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 3,
		levelRequirements: {
			slayer: 47
		},
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab],
		canCannon: true
	},
	{
		id: Monsters.BronzeDragon.id,
		name: Monsters.BronzeDragon.name,
		aliases: Monsters.BronzeDragon.aliases,
		timeToFinish: Time.Second * 85,
		table: Monsters.BronzeDragon,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		healAmountNeeded: 25,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true
	},
	{
		id: Monsters.BrutalBlueDragon.id,
		name: Monsters.BrutalBlueDragon.name,
		aliases: Monsters.BrutalBlueDragon.aliases,
		timeToFinish: Time.Second * 140,
		table: Monsters.BrutalBlueDragon,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems(['Draconic visage']),
		qpRequired: 0,
		healAmountNeeded: 75,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic]
	},
	{
		id: Monsters.BrutalGreenDragon.id,
		name: Monsters.BrutalGreenDragon.name,
		aliases: Monsters.BrutalGreenDragon.aliases,
		timeToFinish: Time.Second * 130,
		table: Monsters.BrutalGreenDragon,

		wildy: false,

		difficultyRating: 4,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic]
	},
	{
		id: Monsters.Crocodile.id,
		name: Monsters.Crocodile.name,
		aliases: Monsters.Crocodile.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Crocodile,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		canCannon: true,
		// Not multi but you can safespot for same effect.
		cannonMulti: true,
		canBarrage: false,
		healAmountNeeded: 24,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Dagannoth.id,
		name: Monsters.Dagannoth.name,
		aliases: Monsters.Dagannoth.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.Dagannoth,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 2,
		itemInBankBoosts: [
			{
				[itemID('Dragonbone necklace')]: 2
			}
		],
		healAmountNeeded: 9,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.DagannothSpawn.id,
		name: Monsters.DagannothSpawn.name,
		aliases: Monsters.DagannothSpawn.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.DagannothSpawn,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 2,
		healAmountNeeded: 9,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.DaganothFledgeling.id,
		name: Monsters.DaganothFledgeling.name,
		aliases: Monsters.DaganothFledgeling.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.DaganothFledgeling,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 2,
		healAmountNeeded: 16,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.DeviantSpectre.id,
		name: Monsters.DeviantSpectre.name,
		aliases: Monsters.DeviantSpectre.aliases,
		timeToFinish: Time.Second * 37,
		table: Monsters.DeviantSpectre,

		wildy: false,

		difficultyRating: 4,
		existsInCatacombs: true,
		qpRequired: 0,
		levelRequirements: {
			slayer: 60
		},
		superior: Monsters.RepugnantSpectre,
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.DustDevil.id,
		name: Monsters.DustDevil.name,
		aliases: Monsters.DustDevil.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.DustDevil,

		wildy: false,

		difficultyRating: 2,
		existsInCatacombs: true,
		notifyDrops: resolveItems(['Dragon chainbody', 'Dust battlestaff']),
		qpRequired: 4,
		levelRequirements: {
			slayer: 65
		},
		superior: Monsters.ChokeDevil,
		itemInBankBoosts: [
			{
				[itemID('Kodai wand')]: 15,
				[itemID('Staff of the dead')]: 10
			}
		],
		canCannon: true,
		cannonMulti: false,
		canBarrage: true,
		healAmountNeeded: 16,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.ElfArcher.id,
		name: Monsters.ElfArcher.name,
		aliases: Monsters.ElfArcher.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.ElfArcher,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 22,
		healAmountNeeded: 22,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.ElfWarrior.id,
		name: Monsters.ElfWarrior.name,
		aliases: Monsters.ElfWarrior.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.ElfWarrior,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 22,
		healAmountNeeded: 26,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.FeverSpider.id,
		name: Monsters.FeverSpider.name,
		aliases: Monsters.FeverSpider.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.FeverSpider,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 42
		},
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.FireGiant.id,
		name: Monsters.FireGiant.name,
		aliases: Monsters.FireGiant.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.FireGiant,

		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 2,
		notifyDrops: resolveItems(['Giant champion scroll']),
		qpRequired: 0,
		healAmountNeeded: 17,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true
	},
	{
		id: Monsters.Gargoyle.id,
		name: Monsters.Gargoyle.name,
		aliases: Monsters.Gargoyle.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.Gargoyle,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 75
		},
		superior: Monsters.MarbleGargoyle,
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.GrotesqueGuardians.id,
		name: Monsters.GrotesqueGuardians.name,
		aliases: Monsters.GrotesqueGuardians.aliases,
		timeToFinish: Time.Second * 180,
		table: Monsters.GrotesqueGuardians,

		wildy: false,

		difficultyRating: 4,
		notifyDrops: resolveItems(['Noon', 'Jar of stone']),
		itemsRequired: deepResolveItems(['Brittle key']),
		slayerOnly: true,
		qpRequired: 0,
		levelRequirements: {
			slayer: 75
		},
		itemInBankBoosts: [
			{
				[itemID('Armadyl crossbow')]: 3,
				[itemID('Toxic blowpipe')]: 5
			},
			{
				[itemID('Saradomin godsword')]: 6,
				[itemID('Dragon claws')]: 10
			},
			{
				[itemID('Scythe of vitur')]: 10,
				[itemID('Scythe of vitur (uncharged)')]: 10
			}
		],
		healAmountNeeded: 20 * 12,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackRanged, GearStat.AttackMagic]
	},
	{
		id: Monsters.GreaterNechryael.id,
		name: Monsters.GreaterNechryael.name,
		aliases: Monsters.GreaterNechryael.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.GreaterNechryael,

		wildy: false,

		difficultyRating: 5,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10,
				[itemID('Staff of the dead')]: 15,
				[itemID('Kodai wand')]: 20
			}
		],
		existsInCatacombs: true,
		levelRequirements: {
			slayer: 80
		},
		superior: Monsters.Nechryarch,
		healAmountNeeded: 28,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush],
		canBarrage: true,
		canCannon: true
	},
	{
		id: Monsters.GreenDragon.id,
		name: Monsters.GreenDragon.name,
		aliases: Monsters.GreenDragon.aliases,
		timeToFinish: Time.Second * 26,
		table: Monsters.GreenDragon,

		wildy: true,

		difficultyRating: 5,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		healAmountNeeded: 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true
	},
	{
		id: Monsters.HarpieBugSwarm.id,
		name: Monsters.HarpieBugSwarm.name,
		aliases: Monsters.HarpieBugSwarm.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.HarpieBugSwarm,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 1,
		levelRequirements: {
			slayer: 33,
			firemaking: 33
		},
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Hellhound.id,
		name: Monsters.Hellhound.name,
		aliases: Monsters.Hellhound.aliases,
		timeToFinish: Time.Second * 39,
		table: Monsters.Hellhound,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 3,
		notifyDrops: resolveItems(['Smouldering stone']),
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab],
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 15
			}
		],
		canCannon: true,
		// Not multi but you can safespot for the same effect
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.IceGiant.id,
		name: Monsters.IceGiant.name,
		aliases: Monsters.IceGiant.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.IceGiant,
		wildy: true,

		difficultyRating: 3,
		notifyDrops: resolveItems(['Giant champion scroll']),
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.IceTroll.id,
		name: Monsters.IceTroll.name,
		aliases: Monsters.IceTroll.aliases,
		timeToFinish: Time.Second * 23,
		table: Monsters.IceTroll,
		wildy: false,

		difficultyRating: 4,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Neitiznot shield')]: 7
			}
		],
		healAmountNeeded: 22,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.InfernalMage.id,
		name: Monsters.InfernalMage.name,
		aliases: Monsters.InfernalMage.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.InfernalMage,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 45
		},
		superior: Monsters.MalevolentMage,
		healAmountNeeded: 16,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.IorwerthArcher.id,
		name: Monsters.IorwerthArcher.name,
		aliases: Monsters.IorwerthArcher.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.IorwerthArcher,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 12,
		healAmountNeeded: 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackRanged],
		canCannon: true
	},
	{
		id: Monsters.IorwerthWarrior.id,
		name: Monsters.IorwerthWarrior.name,
		aliases: Monsters.IorwerthWarrior.aliases,
		timeToFinish: Time.Second * 32,
		table: Monsters.IorwerthWarrior,

		wildy: false,

		difficultyRating: 5,
		qpRequired: 12,
		healAmountNeeded: 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab],
		canCannon: true
	},
	{
		id: Monsters.Jelly.id,
		name: Monsters.Jelly.name,
		aliases: Monsters.Jelly.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Jelly,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 52
		},
		superior: Monsters.VitreousJelly,
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.JungleHorror.id,
		name: Monsters.JungleHorror.name,
		aliases: Monsters.JungleHorror.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.JungleHorror,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 20,
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true
	},
	{
		id: Monsters.Kurask.id,
		name: Monsters.Kurask.name,
		aliases: Monsters.Kurask.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.Kurask,

		wildy: false,

		difficultyRating: 2,
		itemInBankBoosts: [
			{
				[itemID('Leaf-bladed battleaxe')]: 15
			}
		],
		notifyDrops: resolveItems(['Kurask head']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 70
		},
		superior: Monsters.KingKurask,
		healAmountNeeded: 26,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.LesserDemon.id,
		name: Monsters.LesserDemon.name,
		aliases: Monsters.LesserDemon.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.LesserDemon,

		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true,
		// No multi spots (i think) but you can safespot for same effect.
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Molanisk.id,
		name: Monsters.Molanisk.name,
		aliases: Monsters.Molanisk.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.Molanisk,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 39
		},
		healAmountNeeded: 12,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.MossGiant.id,
		name: Monsters.MossGiant.name,
		aliases: Monsters.MossGiant.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.MossGiant,

		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 17,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash],
		canCannon: true
	},
	{
		id: Monsters.Bryophyta.id,
		name: Monsters.Bryophyta.name,
		aliases: Monsters.Bryophyta.aliases,
		timeToFinish: Time.Second * 75,
		table: Monsters.Bryophyta,

		wildy: false,

		existsInCatacombs: false,
		difficultyRating: 3,
		qpRequired: 0,
		itemsRequired: resolveItems(['Mossy key']),
		itemCost: new Bank().add('Mossy key', 1),
		healAmountNeeded: 20 * 8,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic]
	},
	{
		id: Monsters.MountainTroll.id,
		name: Monsters.MountainTroll.name,
		aliases: Monsters.MountainTroll.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.MountainTroll,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 1,
		canCannon: true,
		healAmountNeeded: 28,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Mourner.id,
		name: Monsters.Mourner.name,
		aliases: Monsters.Mourner.aliases,
		timeToFinish: Time.Second * 13,
		table: Monsters.Mourner,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		healAmountNeeded: 12,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.MutatedBloodveld.id,
		name: Monsters.MutatedBloodveld.name,
		aliases: Monsters.MutatedBloodveld.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.MutatedBloodveld,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 105,
		levelRequirements: {
			slayer: 50
		},
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 15
			}
		],
		superior: Monsters.InsatiableMutatedBloodveld,
		healAmountNeeded: 40,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackMagic],
		canCannon: true,
		cannonMulti: true
	},
	{
		id: Monsters.Nechryael.id,
		name: Monsters.Nechryael.name,
		aliases: Monsters.Nechryael.aliases,
		timeToFinish: Time.Second * 19,
		table: Monsters.Nechryael,

		wildy: false,

		difficultyRating: 4,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10
			}
		],
		levelRequirements: {
			slayer: 80
		},
		superior: Monsters.Nechryarch,
		healAmountNeeded: 24,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Ogre.id,
		name: Monsters.Ogre.name,
		aliases: Monsters.Ogre.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Ogre,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 16,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		// Safespottable for multi-effect
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.OgressShaman.id,
		name: Monsters.OgressShaman.name,
		aliases: Monsters.OgressShaman.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.OgressShaman,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.OgressWarrior.id,
		name: Monsters.OgressWarrior.name,
		aliases: Monsters.OgressWarrior.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.OgressWarrior,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Otherworldlybeing.id,
		name: Monsters.Otherworldlybeing.name,
		aliases: Monsters.Otherworldlybeing.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Otherworldlybeing,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 12,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.SeaSnakeHatchling.id,
		name: Monsters.SeaSnakeHatchling.name,
		aliases: Monsters.SeaSnakeHatchling.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.SeaSnakeHatchling,

		wildy: false,

		difficultyRating: 2,
		levelRequirements: {
			slayer: 40
		},
		itemsRequired: resolveItems(['Antidote++(4)']),
		qpRequired: 57,
		healAmountNeeded: 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.SeaSnakeYoung.id,
		name: Monsters.SeaSnakeYoung.name,
		aliases: Monsters.SeaSnakeYoung.aliases,
		timeToFinish: Time.Second * 28,
		table: Monsters.SeaSnakeYoung,

		wildy: false,

		difficultyRating: 2,
		levelRequirements: {
			slayer: 40
		},
		itemsRequired: resolveItems(['Antidote++(4)']),
		qpRequired: 57,
		healAmountNeeded: 30,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.ShadowWarrior.id,
		name: Monsters.ShadowWarrior.name,
		aliases: Monsters.ShadowWarrior.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.ShadowWarrior,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 111,
		healAmountNeeded: 12,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.SpiritualMage.id,
		name: Monsters.SpiritualMage.name,
		aliases: Monsters.SpiritualMage.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SpiritualMage,

		wildy: false,

		difficultyRating: 4,
		qpRequired: 0,
		levelRequirements: {
			agility: 60,
			slayer: 83
		},
		healAmountNeeded: 27,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.SpiritualRanger.id,
		name: Monsters.SpiritualRanger.name,
		aliases: Monsters.SpiritualRanger.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.SpiritualRanger,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			slayer: 63
		},
		healAmountNeeded: 25,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackRanged]
	},
	{
		id: Monsters.SpiritualWarrior.id,
		name: Monsters.SpiritualWarrior.name,
		aliases: Monsters.SpiritualWarrior.aliases,
		timeToFinish: Time.Second * 19,
		table: Monsters.SpiritualWarrior,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			agility: 60,
			slayer: 68
		},
		healAmountNeeded: 26,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.TerrorDog.id,
		name: Monsters.TerrorDog.name,
		aliases: Monsters.TerrorDog.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.TerrorDog,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 3,
		levelRequirements: {
			slayer: 40
		},
		healAmountNeeded: 28,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.TrollGeneral.id,
		name: Monsters.TrollGeneral.name,
		aliases: Monsters.TrollGeneral.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.TrollGeneral,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		healAmountNeeded: 20 * 2,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Turoth.id,
		name: Monsters.Turoth.name,
		aliases: Monsters.Turoth.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Turoth,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Leaf-bladed battleaxe')]: 5
			}
		],
		levelRequirements: {
			slayer: 55
		},
		superior: Monsters.SpikedTuroth,
		healAmountNeeded: 18,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.WarpedJelly.id,
		name: Monsters.WarpedJelly.name,
		aliases: Monsters.WarpedJelly.aliases,
		timeToFinish: Time.Second * 19,
		table: Monsters.WarpedJelly,

		wildy: false,

		difficultyRating: 3,
		existsInCatacombs: true,
		itemsRequired: deepResolveItems([
			["Black d'hide body", "Karil's leathertop", 'Armadyl chestplate'],
			["Black d'hide chaps", "Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 52
		},
		superior: Monsters.VitreousWarpedJelly,
		healAmountNeeded: 30,
		attackStyleToUse: GearSetupTypes.Mage,
		attackStylesUsed: [GearStat.AttackMagic],
		canBarrage: true
	},
	{
		id: Monsters.Werewolf.id,
		name: Monsters.Werewolf.name,
		aliases: Monsters.Werewolf.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Werewolf,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Wolfbane')]: 10
			}
		],
		healAmountNeeded: 13,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	}
];
