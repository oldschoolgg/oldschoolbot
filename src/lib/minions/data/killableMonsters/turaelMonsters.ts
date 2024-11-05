import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { deepResolveItems } from 'oldschooljs/dist/util/util';
import { GearStat } from '../../../gear/types';
import { SkillsEnum } from '../../../skilling/types';
import type { KillableMonster } from '../../types';

export const turaelMonsters: KillableMonster[] = [
	{
		id: Monsters.Banshee.id,
		name: Monsters.Banshee.name,
		aliases: Monsters.Banshee.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.Banshee,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 15
		},
		superior: Monsters.ScreamingBanshee
	},
	{
		id: Monsters.Bat.id,
		name: Monsters.Bat.name,
		aliases: Monsters.Bat.aliases,
		timeToFinish: Time.Second * 5,
		table: Monsters.Bat,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true
	},
	{
		id: Monsters.BearCub.id,
		name: Monsters.BearCub.name,
		aliases: Monsters.BearCub.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.BearCub,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.BigWolf.id,
		name: Monsters.BigWolf.name,
		aliases: Monsters.BigWolf.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.BigWolf,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Bird.id,
		name: Monsters.Bird.name,
		aliases: Monsters.Bird.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Bird,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.BlackBear.id,
		name: Monsters.BlackBear.name,
		aliases: Monsters.BlackBear.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.BlackBear,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true
	},
	{
		id: Monsters.BlackGuard.id,
		name: Monsters.BlackGuard.name,
		aliases: Monsters.BlackGuard.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.BlackGuard,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true
	},
	{
		id: Monsters.CaveBug.id,
		name: Monsters.CaveBug.name,
		aliases: Monsters.CaveBug.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.CaveBug,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 7
		}
	},
	{
		id: Monsters.CaveCrawler.id,
		name: Monsters.CaveCrawler.name,
		aliases: Monsters.CaveCrawler.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.CaveCrawler,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 10
		},
		superior: Monsters.ChasmCrawler
	},
	{
		id: Monsters.CaveGoblinGuard.id,
		name: Monsters.CaveGoblinGuard.name,
		aliases: Monsters.CaveGoblinGuard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.CaveGoblinGuard,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 8,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.CaveSlime.id,
		name: Monsters.CaveSlime.name,
		aliases: Monsters.CaveSlime.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.CaveSlime,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Slayer helmet')]: 5,
				[itemID('Slayer helmet (i)')]: 5
			}
		],
		levelRequirements: {
			slayer: 17
		}
	},
	{
		id: Monsters.ChaosDwarf.id,
		name: Monsters.ChaosDwarf.name,
		aliases: Monsters.ChaosDwarf.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.ChaosDwarf,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Chicken.id,
		name: Monsters.Chicken.name,
		aliases: Monsters.Chicken.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Chicken,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Cow.id,
		name: Monsters.Cow.name,
		aliases: Monsters.Cow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Cow,
		emoji: '🐮',
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.CowCalf.id,
		name: Monsters.CowCalf.name,
		aliases: Monsters.CowCalf.aliases,
		timeToFinish: Time.Second * 4,
		table: Monsters.CowCalf,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.CrawlingHand.id,
		name: Monsters.CrawlingHand.name,
		aliases: Monsters.CrawlingHand.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.CrawlingHand,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 5
		},
		superior: Monsters.CrushingHand
	},
	{
		id: Monsters.CryptRat.id,
		name: Monsters.CryptRat.name,
		aliases: Monsters.CryptRat.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.CryptRat,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 1
	},
	{
		id: Monsters.DeathWing.id,
		name: Monsters.DeathWing.name,
		aliases: Monsters.DeathWing.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.DeathWing,
		wildy: false,

		difficultyRating: 3,
		qpRequired: 111
	},
	{
		id: Monsters.DemonicGorilla.id,
		name: Monsters.DemonicGorilla.name,
		aliases: Monsters.DemonicGorilla.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.DemonicGorilla,
		wildy: false,

		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			['Torva platebody', 'Bandos chestplate'],
			["Verac's plateskirt", 'Bandos tassets', 'Torva platelegs'],
			['Arclight', 'Emberlight', 'Abyssal whip', 'Dragon scimitar'],
			['Rune crossbow', "Karil's crossbow", 'Armadyl crossbow'],
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		qpRequired: 175,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 20,
				[itemID('Emberlight')]: 25
			}
		],
		levelRequirements: {
			slayer: 69
		},
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.DesertLizard.id,
		name: Monsters.DesertLizard.name,
		aliases: Monsters.DesertLizard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.DesertLizard,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 11,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.DesertWolf.id,
		name: Monsters.DesertWolf.name,
		aliases: Monsters.DesertWolf.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.DesertWolf,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 11,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Duck.id,
		name: Monsters.Duck.name,
		aliases: Monsters.Duck.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Duck,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Duckling.id,
		name: Monsters.Duckling.name,
		aliases: Monsters.Duckling.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Duckling,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.DungeonRat.id,
		name: Monsters.DungeonRat.name,
		aliases: Monsters.DungeonRat.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.DungeonRat,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Dwarf.id,
		name: Monsters.Dwarf.name,
		aliases: Monsters.Dwarf.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.Dwarf,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.DwarfGangMember.id,
		name: Monsters.DwarfGangMember.name,
		aliases: Monsters.DwarfGangMember.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.DwarfGangMember,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 15,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Ghost.id,
		name: Monsters.Ghost.name,
		aliases: Monsters.Ghost.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Ghost,
		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.GiantBat.id,
		name: Monsters.GiantBat.name,
		aliases: Monsters.GiantBat.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.GiantBat,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.GiantCryptSpider.id,
		name: Monsters.GiantCryptSpider.name,
		aliases: Monsters.GiantCryptSpider.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.GiantCryptSpider,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 1,
		canCannon: false,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.GiantRat.id,
		name: Monsters.GiantRat.name,
		aliases: Monsters.GiantRat.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.GiantRat,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.GiantSpider.id,
		name: Monsters.GiantSpider.name,
		aliases: Monsters.GiantSpider.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.GiantSpider,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 1
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Goblin,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.GrizzlyBear.id,
		name: Monsters.GrizzlyBear.name,
		aliases: Monsters.GrizzlyBear.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.GrizzlyBear,
		wildy: true,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 8,
		pkBaseDeathChance: 4,
		revsWeaponBoost: true
	},
	{
		id: Monsters.GrizzlyBearCub.id,
		name: Monsters.GrizzlyBearCub.name,
		aliases: Monsters.GrizzlyBearCub.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.GrizzlyBearCub,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.GuardDog.id,
		name: Monsters.GuardDog.name,
		aliases: Monsters.GuardDog.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.GuardDog,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Icefiend.id,
		name: Monsters.Icefiend.name,
		aliases: Monsters.Icefiend.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Icefiend,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 8,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.IceWolf.id,
		name: Monsters.IceWolf.name,
		aliases: Monsters.IceWolf.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.IceWolf,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 26,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		cannonMulti: true
	},
	{
		id: Monsters.Jackal.id,
		name: Monsters.Jackal.name,
		aliases: Monsters.Jackal.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.Jackal,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 10,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.JungleWolf.id,
		name: Monsters.JungleWolf.name,
		aliases: Monsters.JungleWolf.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.JungleWolf,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 22,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.KalphiteGuardian.id,
		name: Monsters.KalphiteGuardian.name,
		aliases: Monsters.KalphiteGuardian.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.KalphiteGuardian,

		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		healAmountNeeded: 40,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canBarrage: false
	},
	{
		id: Monsters.KalphiteSoldier.id,
		name: Monsters.KalphiteSoldier.name,
		aliases: Monsters.KalphiteSoldier.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.KalphiteSoldier,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.KalphiteWorker.id,
		name: Monsters.KalphiteWorker.name,
		aliases: Monsters.KalphiteWorker.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.KalphiteWorker,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		healAmountNeeded: 12,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.KingScorpion.id,
		name: Monsters.KingScorpion.name,
		aliases: Monsters.KingScorpion.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.KingScorpion,

		wildy: true,

		difficultyRating: 3,
		qpRequired: 0,
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Lizard.id,
		name: Monsters.Lizard.name,
		aliases: Monsters.Lizard.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lizard,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Lobstrosity.id,
		name: Monsters.Lobstrosity.name,
		aliases: Monsters.Lobstrosity.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lobstrosity,

		wildy: false,

		difficultyRating: 1,
		// Merfolk trident has similar items including all water tridents
		itemsRequired: deepResolveItems([['Merfolk trident', 'Uncharged trident', 'Brine sabre']]),
		qpRequired: 10,
		healAmountNeeded: 22,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackStab]
	},
	{
		id: Monsters.Minotaur.id,
		name: Monsters.Minotaur.name,
		aliases: Monsters.Minotaur.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.Minotaur,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		healAmountNeeded: 9,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Monkey.id,
		name: Monsters.Monkey.name,
		aliases: Monsters.Monkey.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Monkey,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		defaultAttackStyles: [SkillsEnum.Ranged],
		disallowedAttackStyles: [SkillsEnum.Strength, SkillsEnum.Attack]
	},
	{
		id: Monsters.MonkeyArcher.id,
		name: Monsters.MonkeyArcher.name,
		aliases: Monsters.MonkeyArcher.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MonkeyArcher,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 20,
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength],
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged]
	},
	{
		id: Monsters.MonkeyGuard.id,
		name: Monsters.MonkeyGuard.name,
		aliases: Monsters.MonkeyGuard.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.MonkeyGuard,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 20,
		healAmountNeeded: 50,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.MonkeyZombie.id,
		name: Monsters.MonkeyZombie.name,
		aliases: Monsters.MonkeyZombie.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MonkeyZombie,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 20,
		healAmountNeeded: 17,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.MountedTerrorBirdGnome.id,
		name: Monsters.MountedTerrorBirdGnome.name,
		aliases: Monsters.MountedTerrorBirdGnome.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.MountedTerrorBirdGnome,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Penguin.id,
		name: Monsters.Penguin.name,
		aliases: Monsters.Penguin.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Penguin,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.PitScorpion.id,
		name: Monsters.PitScorpion.name,
		aliases: Monsters.PitScorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.PitScorpion,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 11,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.PoisonScorpion.id,
		name: Monsters.PoisonScorpion.name,
		aliases: Monsters.PoisonScorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.PoisonScorpion,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 11,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Rat.id,
		name: Monsters.Rat.name,
		aliases: Monsters.Rat.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Rat,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Rooster.id,
		name: Monsters.Rooster.name,
		aliases: Monsters.Rooster.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Rooster,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Scorpion.id,
		name: Monsters.Scorpion.name,
		aliases: Monsters.Scorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Scorpion,

		wildy: true,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 8,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		pkActivityRating: 3,
		pkBaseDeathChance: 2,
		revsWeaponBoost: true
	},
	{
		id: Monsters.Seagull.id,
		name: Monsters.Seagull.name,
		aliases: Monsters.Seagull.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Seagull,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.ShadowSpider.id,
		name: Monsters.ShadowSpider.name,
		aliases: Monsters.ShadowSpider.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.ShadowSpider,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 1,
		itemInBankBoosts: [
			{
				[itemID('Spectral spirit shield')]: 3
			}
		],
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Skeleton.id,
		name: Monsters.Skeleton.name,
		aliases: Monsters.Skeleton.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Skeleton,

		wildy: true,

		existsInCatacombs: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 11,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true
	},
	{
		id: Monsters.SkeletonFremennik.id,
		name: Monsters.SkeletonFremennik.name,
		aliases: Monsters.SkeletonFremennik.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SkeletonFremennik,

		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 13,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.SkeletonMage.id,
		name: Monsters.SkeletonMage.name,
		aliases: Monsters.SkeletonMage.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SkeletonMage,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.Skogre.id,
		name: Monsters.Skogre.name,
		aliases: Monsters.Skogre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Skogre,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 5,
		healAmountNeeded: 32,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.SmallLizard.id,
		name: Monsters.SmallLizard.name,
		aliases: Monsters.SmallLizard.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.SmallLizard,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},
		healAmountNeeded: 9,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Spider.id,
		name: Monsters.Spider.name,
		aliases: Monsters.Spider.aliases,
		timeToFinish: Time.Second * 5,
		table: Monsters.Spider,

		wildy: true,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		pkActivityRating: 1,
		pkBaseDeathChance: 1,
		revsWeaponBoost: true
	},
	{
		id: Monsters.SulphurLizard.id,
		name: Monsters.SulphurLizard.name,
		aliases: Monsters.SulphurLizard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SulphurLizard,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 44
		},
		canCannon: true,
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.TempleSpider.id,
		name: Monsters.TempleSpider.name,
		aliases: Monsters.TempleSpider.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.TempleSpider,

		wildy: false,

		difficultyRating: 2,
		qpRequired: 0,
		healAmountNeeded: 18,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.TerrorBird.id,
		name: Monsters.TerrorBird.name,
		aliases: Monsters.TerrorBird.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.TerrorBird,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 13,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.TorturedGorilla.id,
		name: Monsters.TorturedGorilla.name,
		aliases: Monsters.TorturedGorilla.aliases,
		timeToFinish: Time.Second * 70,
		table: Monsters.TorturedGorilla,
		wildy: false,

		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			['Torva platebody', 'Bandos chestplate'],
			["Verac's plateskirt", 'Bandos tassets', 'Torva platelegs'],
			['Abyssal whip', 'Dragon scimitar']
		]),
		qpRequired: 175,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 20,
				[itemID('Emberlight')]: 25
			}
		],
		levelRequirements: {
			slayer: 69
		},
		healAmountNeeded: 65,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.TorturedSoul.id,
		name: Monsters.TorturedSoul.name,
		aliases: Monsters.TorturedSoul.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.TorturedSoul,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 1,
		healAmountNeeded: 15,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.TwistedBanshee.id,
		name: Monsters.TwistedBanshee.name,
		aliases: Monsters.TwistedBanshee.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.TwistedBanshee,
		wildy: false,

		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 15
		},
		superior: Monsters.ScreamingTwistedBanshee,
		healAmountNeeded: 25,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.UndeadChicken.id,
		name: Monsters.UndeadChicken.name,
		aliases: Monsters.UndeadChicken.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.UndeadChicken,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 1
	},
	{
		id: Monsters.UndeadDruid.id,
		name: Monsters.UndeadDruid.name,
		aliases: Monsters.UndeadDruid.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.UndeadDruid,
		wildy: false,

		difficultyRating: 3,
		qpRequired: 0,
		healAmountNeeded: 48,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic]
	},
	{
		id: Monsters.UndeadOne.id,
		name: Monsters.UndeadOne.name,
		aliases: Monsters.UndeadOne.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.UndeadOne,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.WhiteWolf.id,
		name: Monsters.WhiteWolf.name,
		aliases: Monsters.WhiteWolf.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.WhiteWolf,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.WildDog.id,
		name: Monsters.WildDog.name,
		aliases: Monsters.WildDog.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.WildDog,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 16,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Wolf.id,
		name: Monsters.Wolf.name,
		aliases: Monsters.Wolf.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Wolf,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false,
		healAmountNeeded: 12,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Zogre.id,
		name: Monsters.Zogre.name,
		aliases: Monsters.Zogre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Zogre,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 5,
		healAmountNeeded: 28,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Zombie.id,
		name: Monsters.Zombie.name,
		aliases: Monsters.Zombie.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Zombie,
		wildy: true,

		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false,
		healAmountNeeded: 9,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush],
		pkActivityRating: 6,
		pkBaseDeathChance: 4,
		revsWeaponBoost: true
	},
	{
		id: Monsters.ZombieRat.id,
		name: Monsters.ZombieRat.name,
		aliases: Monsters.ZombieRat.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.ZombieRat,
		wildy: false,

		difficultyRating: 1,
		qpRequired: 32,
		healAmountNeeded: 6,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.ArmouredZombie.id,
		name: Monsters.ArmouredZombie.name,
		aliases: Monsters.ArmouredZombie.aliases,
		timeToFinish: Time.Second * 23,
		table: Monsters.ArmouredZombie,
		wildy: false,

		difficultyRating: 2,
		qpRequired: 20,
		canBarrage: true,
		canChinning: true,
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush]
	}
];
