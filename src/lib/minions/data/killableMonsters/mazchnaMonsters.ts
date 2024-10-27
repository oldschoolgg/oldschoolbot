import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { GearStat } from '../../../gear/types';
import itemID from '../../../util/itemID';
import type { KillableMonster } from '../../types';

export const mazchnaMonsters: KillableMonster[] = [
	{
		id: Monsters.AsynShade.id,
		name: Monsters.AsynShade.name,
		aliases: Monsters.AsynShade.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.AsynShade,
		wildy: false,

		difficultyRating: 4,
		qpRequired: 4
	},
	{
		id: Monsters.Catablepon.id,
		name: Monsters.Catablepon.name,
		aliases: Monsters.Catablepon.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Catablepon,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 10,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackStab],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Cockatrice.id,
		name: Monsters.Cockatrice.name,
		aliases: Monsters.Cockatrice.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Cockatrice,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 25
		},

		superior: Monsters.Cockathrice,
		healAmountNeeded: 12,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Cyclops.id,
		name: Monsters.Cyclops.name,
		aliases: Monsters.Cyclops.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.Cyclops,
		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 24,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.EarthWarrior.id,
		name: Monsters.EarthWarrior.name,
		aliases: Monsters.EarthWarrior.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.EarthWarrior,
		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			agility: 15
		},
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 4,
		pkBaseDeathChance: 2,
		revsWeaponBoost: true,
		canBePked: true
	},
	{
		id: Monsters.FeralVampyre.id,
		name: Monsters.FeralVampyre.name,
		aliases: Monsters.FeralVampyre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.FeralVampyre,
		wildy: false,
		itemInBankBoosts: [
			{
				[itemID('Ivandis flail')]: 12,
				[itemID('Blisterwood flail')]: 15
			}
		],

		difficultyRating: 2,
		qpRequired: 1
	},
	{
		id: Monsters.FiyrShade.id,
		name: Monsters.FiyrShade.name,
		aliases: Monsters.FiyrShade.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.FiyrShade,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 4
	},
	{
		id: Monsters.FleshCrawler.id,
		name: Monsters.FleshCrawler.name,
		aliases: Monsters.FleshCrawler.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.FleshCrawler,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Ghoul.id,
		name: Monsters.Ghoul.name,
		aliases: Monsters.Ghoul.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Ghoul,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 1,
		canCannon: true,
		// Can safespot for the multi-effect
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.HillGiant.id,
		name: Monsters.HillGiant.name,
		aliases: Monsters.HillGiant.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.HillGiant,
		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 13,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 5,
		revsWeaponBoost: true
	},
	{
		id: Monsters.Obor.id,
		name: Monsters.Obor.name,
		aliases: Monsters.Obor.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.Obor,
		wildy: false,

		existsInCatacombs: false,
		difficultyRating: 3,
		qpRequired: 0,
		itemCost: { itemCost: new Bank().add('Giant key', 1), qtyPerKill: 1 },
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged]
	},
	{
		id: Monsters.Hobgoblin.id,
		name: Monsters.Hobgoblin.name,
		aliases: Monsters.Hobgoblin.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.Hobgoblin,
		wildy: true,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.IceWarrior.id,
		name: Monsters.IceWarrior.name,
		aliases: Monsters.IceWarrior.aliases,
		timeToFinish: Time.Second * 28,
		table: Monsters.IceWarrior,
		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		healAmountNeeded: 17,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 4,
		pkBaseDeathChance: 3,
		revsWeaponBoost: true
	},
	{
		id: Monsters.Killerwatt.id,
		name: Monsters.Killerwatt.name,
		aliases: Monsters.Killerwatt.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Killerwatt,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 4,
		levelRequirements: {
			slayer: 37
		},
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic]
	},
	{
		id: Monsters.LoarShade.id,
		name: Monsters.LoarShade.name,
		aliases: Monsters.LoarShade.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.LoarShade,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 4
	},
	{
		id: Monsters.Mogre.id,
		name: Monsters.Mogre.name,
		aliases: Monsters.Mogre.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Mogre,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 32
		},
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.PhrinShade.id,
		name: Monsters.PhrinShade.name,
		aliases: Monsters.PhrinShade.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.PhrinShade,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 4
	},
	{
		id: Monsters.UriumShade.id,
		name: Monsters.UriumShade.name,
		aliases: Monsters.UriumShade.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.UriumShade,

		wildy: false,

		difficultyRating: 6,
		qpRequired: 4
	},
	{
		id: Monsters.Pyrefiend.id,
		name: Monsters.Pyrefiend.name,
		aliases: Monsters.Pyrefiend.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.Pyrefiend,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 30
		},
		superior: Monsters.FlamingPyrelord,
		healAmountNeeded: 8,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.Pyrelord.id,
		name: Monsters.Pyrelord.name,
		aliases: Monsters.Pyrelord.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Pyrelord,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			slayer: 30
		},
		superior: Monsters.FlamingPyrelord,
		healAmountNeeded: 15,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.RiylShade.id,
		name: Monsters.RiylShade.name,
		aliases: Monsters.RiylShade.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.RiylShade,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 4
	},
	{
		id: Monsters.Rockslug.id,
		name: Monsters.Rockslug.name,
		aliases: Monsters.Rockslug.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Rockslug,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 20
		},
		superior: Monsters.GiantRockslug,
		healAmountNeeded: 12,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Shade.id,
		name: Monsters.Shade.name,
		aliases: Monsters.Shade.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.Shade,

		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.VampyreJuvinate.id,
		name: Monsters.VampyreJuvinate.name,
		aliases: Monsters.VampyreJuvinate.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.VampyreJuvinate,

		wildy: false,
		itemInBankBoosts: [
			{
				[itemID('Ivandis flail')]: 12,
				[itemID('Blisterwood flail')]: 15
			}
		],

		difficultyRating: 2,
		qpRequired: 1
	},
	{
		id: Monsters.Vyrewatch.id,
		name: Monsters.Vyrewatch.name,
		aliases: Monsters.Vyrewatch.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Vyrewatch,

		wildy: false,
		itemInBankBoosts: [
			{
				[itemID('Ivandis flail')]: 12,
				[itemID('Blisterwood flail')]: 15
			}
		],

		difficultyRating: 4,
		qpRequired: 0,
		healAmountNeeded: 28,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.VyrewatchSentinel.id,
		name: Monsters.VyrewatchSentinel.name,
		aliases: Monsters.VyrewatchSentinel.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.VyrewatchSentinel,

		wildy: false,
		itemInBankBoosts: [
			{
				[itemID('Ivandis flail')]: 12,
				[itemID('Blisterwood flail')]: 15
			}
		],
		difficultyRating: 5,
		qpRequired: 0,
		healAmountNeeded: 40,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.WallBeast.id,
		name: Monsters.WallBeast.name,
		aliases: Monsters.WallBeast.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.WallBeast,
		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		levelRequirements: {
			slayer: 35
		}
	}
];
