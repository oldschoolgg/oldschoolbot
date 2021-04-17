import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { GearSetupTypes, GearStat } from '../../../gear';
import { SkillsEnum } from '../../../skilling/types';
import { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const turaelMonsters: KillableMonster[] = [
	{
		id: Monsters.Banshee.id,
		name: Monsters.Banshee.name,
		aliases: Monsters.Banshee.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.Banshee,
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Slayer helmet')]: 5
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
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.ChompyBird.id,
		name: Monsters.ChompyBird.name,
		aliases: Monsters.ChompyBird.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.ChompyBird,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 3
	},
	{
		id: Monsters.Cow.id,
		name: Monsters.Cow.name,
		aliases: Monsters.Cow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Cow,
		emoji: '🐮',
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			'Bandos chestplate',
			["Verac's plateskirt", 'Bandos tassets'],
			['Arclight', 'Abyssal whip', 'Dragon scimitar'],
			['Rune crossbow', "Karil's crossbow", 'Armadyl crossbow'],
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		qpRequired: 175,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 20
			}
		],
		levelRequirements: {
			slayer: 69
		},
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.DesertLizard.id,
		name: Monsters.DesertLizard.name,
		aliases: Monsters.DesertLizard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.DesertLizard,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.DesertWolf.id,
		name: Monsters.DesertWolf.name,
		aliases: Monsters.DesertWolf.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.DesertWolf,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Duck.id,
		name: Monsters.Duck.name,
		aliases: Monsters.Duck.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Duck,
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Ghost.id,
		name: Monsters.Ghost.name,
		aliases: Monsters.Ghost.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Ghost,
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.GiantCryptSpider.id,
		name: Monsters.GiantCryptSpider.name,
		aliases: Monsters.GiantCryptSpider.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.GiantCryptSpider,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 1,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.GiantRat.id,
		name: Monsters.GiantRat.name,
		aliases: Monsters.GiantRat.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.GiantRat,
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Goblin,
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.GrizzlyBearCub.id,
		name: Monsters.GrizzlyBearCub.name,
		aliases: Monsters.GrizzlyBearCub.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.GrizzlyBearCub,
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.IceWolf.id,
		name: Monsters.IceWolf.name,
		aliases: Monsters.IceWolf.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.IceWolf,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.Jackal.id,
		name: Monsters.Jackal.name,
		aliases: Monsters.Jackal.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.Jackal,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.JungleWolf.id,
		name: Monsters.JungleWolf.name,
		aliases: Monsters.JungleWolf.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.JungleWolf,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.KalphiteGuardian.id,
		name: Monsters.KalphiteGuardian.name,
		aliases: Monsters.KalphiteGuardian.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.KalphiteGuardian,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.KalphiteSoldier.id,
		name: Monsters.KalphiteSoldier.name,
		aliases: Monsters.KalphiteSoldier.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.KalphiteSoldier,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.KingScorpion.id,
		name: Monsters.KingScorpion.name,
		aliases: Monsters.KingScorpion.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.KingScorpion,

		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.Lizard.id,
		name: Monsters.Lizard.name,
		aliases: Monsters.Lizard.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lizard,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		}
	},
	{
		id: Monsters.Lobstrosity.id,
		name: Monsters.Lobstrosity.name,
		aliases: Monsters.Lobstrosity.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lobstrosity,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([
			['Trident of the seas', 'Trident of the swamp', 'Brine sabre']
		]),
		qpRequired: 10
	},
	{
		id: Monsters.Minotaur.id,
		name: Monsters.Minotaur.name,
		aliases: Monsters.Minotaur.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.Minotaur,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Monkey.id,
		name: Monsters.Monkey.name,
		aliases: Monsters.Monkey.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Monkey,

		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 20,
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength]
	},
	{
		id: Monsters.MonkeyGuard.id,
		name: Monsters.MonkeyGuard.name,
		aliases: Monsters.MonkeyGuard.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.MonkeyGuard,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 20
	},
	{
		id: Monsters.MonkeyZombie.id,
		name: Monsters.MonkeyZombie.name,
		aliases: Monsters.MonkeyZombie.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MonkeyZombie,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 20
	},
	{
		id: Monsters.MountedTerrorBirdGnome.id,
		name: Monsters.MountedTerrorBirdGnome.name,
		aliases: Monsters.MountedTerrorBirdGnome.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.MountedTerrorBirdGnome,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Penguin.id,
		name: Monsters.Penguin.name,
		aliases: Monsters.Penguin.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Penguin,

		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.PoisonScorpion.id,
		name: Monsters.PoisonScorpion.name,
		aliases: Monsters.PoisonScorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.PoisonScorpion,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Rat.id,
		name: Monsters.Rat.name,
		aliases: Monsters.Rat.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Rat,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	/*
	{
		id: Monsters.ReanimatedDog.id,
		name: Monsters.ReanimatedDog.name,
		aliases: Monsters.ReanimatedDog.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.ReanimatedDog,
	
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 5
		}
	},
		{
		id: Monsters.ReanimatedScorpion.id,
		name: Monsters.ReanimatedDog.name,
		aliases: Monsters.ReanimatedDog.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.ReanimatedDog,
	
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 5
		}
	},
	*/ {
		id: Monsters.Rooster.id,
		name: Monsters.Rooster.name,
		aliases: Monsters.Rooster.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Rooster,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Scorpion.id,
		name: Monsters.Scorpion.name,
		aliases: Monsters.Scorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Scorpion,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Seagull.id,
		name: Monsters.Seagull.name,
		aliases: Monsters.Seagull.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Seagull,

		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 1,
		itemInBankBoosts: [
			{
				[itemID('Spectral spirit shield')]: 3
			}
		]
	},
	{
		id: Monsters.Skeleton.id,
		name: Monsters.Skeleton.name,
		aliases: Monsters.Skeleton.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Skeleton,

		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.SkeletonFremennik.id,
		name: Monsters.SkeletonFremennik.name,
		aliases: Monsters.SkeletonFremennik.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SkeletonFremennik,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.SkeletonMage.id,
		name: Monsters.SkeletonMage.name,
		aliases: Monsters.SkeletonMage.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SkeletonMage,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Skogre.id,
		name: Monsters.Skogre.name,
		aliases: Monsters.Skogre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Skogre,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 5
	},
	{
		id: Monsters.SmallLizard.id,
		name: Monsters.SmallLizard.name,
		aliases: Monsters.SmallLizard.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.SmallLizard,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		}
	},
	{
		id: Monsters.Spider.id,
		name: Monsters.Spider.name,
		aliases: Monsters.Spider.aliases,
		timeToFinish: Time.Second * 5,
		table: Monsters.Spider,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.SulphurLizard.id,
		name: Monsters.SulphurLizard.name,
		aliases: Monsters.SulphurLizard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SulphurLizard,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 44
		}
	},
	{
		id: Monsters.TempleSpider.id,
		name: Monsters.TempleSpider.name,
		aliases: Monsters.TempleSpider.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.TempleSpider,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.TerrorBird.id,
		name: Monsters.TerrorBird.name,
		aliases: Monsters.TerrorBird.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.TerrorBird,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.TorturedGorilla.id,
		name: Monsters.TorturedGorilla.name,
		aliases: Monsters.TorturedGorilla.aliases,
		timeToFinish: Time.Second * 70,
		table: Monsters.TorturedGorilla,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			'Bandos chestplate',
			["Verac's plateskirt", 'Bandos tassets'],
			['Abyssal whip', 'Dragon scimitar']
		]),
		qpRequired: 175,
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 20
			}
		],
		levelRequirements: {
			slayer: 69
		},
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackSlash, GearStat.AttackRanged]
	},
	{
		id: Monsters.TorturedSoul.id,
		name: Monsters.TorturedSoul.name,
		aliases: Monsters.TorturedSoul.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.TorturedSoul,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 1
	},
	{
		id: Monsters.TwistedBanshee.id,
		name: Monsters.TwistedBanshee.name,
		aliases: Monsters.TwistedBanshee.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.TwistedBanshee,
		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0,
		levelRequirements: {
			slayer: 15
		},
		superior: Monsters.ScreamingTwistedBanshee
	},
	{
		id: Monsters.UndeadChicken.id,
		name: Monsters.UndeadChicken.name,
		aliases: Monsters.UndeadChicken.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.UndeadChicken,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 1
	},
	{
		id: Monsters.UndeadCow.id,
		name: Monsters.UndeadCow.name,
		aliases: Monsters.UndeadCow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.UndeadCow,
		emoji: '🐮',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 1
	},
	{
		id: Monsters.UndeadDruid.id,
		name: Monsters.UndeadDruid.name,
		aliases: Monsters.UndeadDruid.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.UndeadDruid,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.UndeadOne.id,
		name: Monsters.UndeadOne.name,
		aliases: Monsters.UndeadOne.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.UndeadOne,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.WhiteWolf.id,
		name: Monsters.WhiteWolf.name,
		aliases: Monsters.WhiteWolf.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.WhiteWolf,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.WildDog.id,
		name: Monsters.WildDog.name,
		aliases: Monsters.WildDog.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.WildDog,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.Wolf.id,
		name: Monsters.Wolf.name,
		aliases: Monsters.Wolf.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Wolf,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true,
		canBarrage: false
	},
	{
		id: Monsters.Zogre.id,
		name: Monsters.Zogre.name,
		aliases: Monsters.Zogre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Zogre,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 5
	},
	{
		id: Monsters.Zombie.id,
		name: Monsters.Zombie.name,
		aliases: Monsters.Zombie.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Zombie,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: false,
		canBarrage: false
	},
	{
		id: Monsters.ZombieRat.id,
		name: Monsters.ZombieRat.name,
		aliases: Monsters.ZombieRat.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.ZombieRat,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 32
	}
];
