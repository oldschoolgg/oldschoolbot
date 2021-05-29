import { Monsters } from 'oldschooljs';

import { Time } from '../../../../constants';
import {
	EarMuffsSlayerHelmets,
	SpinyHelmetSlayerHelmets
} from '../../../../skilling/skills/slayer/slayerHelmets';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';
// import { GearSetupTypes, GearStat } from '../../../../gear/types';

const TuraelMonsters: KillableMonster[] = [
	{
		id: Monsters.Banshee.id,
		name: Monsters.Banshee.name,
		aliases: Monsters.Banshee.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.Banshee,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([EarMuffsSlayerHelmets]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 15
		},
		superiorName: Monsters.ScreamingBanshee.name,
		superiorId: Monsters.ScreamingBanshee.id,
		superiorTable: Monsters.ScreamingBanshee
	},
	{
		id: Monsters.Bat.id,
		name: Monsters.Bat.name,
		aliases: Monsters.Bat.aliases,
		timeToFinish: Time.Second * 5,
		table: Monsters.Bat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 50
	},
	{
		id: Monsters.BearCub.id,
		name: Monsters.BearCub.name,
		aliases: Monsters.BearCub.aliases,
		timeToFinish: Time.Second * 12,
		table: Monsters.BearCub,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 40
	},
	{
		id: Monsters.BigWolf.id,
		name: Monsters.BigWolf.name,
		aliases: Monsters.BigWolf.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.BigWolf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,

		cannonballs: 4,
		cannonBoost: 35
	},
	{
		id: Monsters.Bird.id,
		name: Monsters.Bird.name,
		aliases: Monsters.Bird.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Bird,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 50
	},
	{
		id: Monsters.BlackBear.id,
		name: Monsters.BlackBear.name,
		aliases: Monsters.BlackBear.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.BlackBear,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.BlackGuard.id,
		name: Monsters.BlackGuard.name,
		aliases: Monsters.BlackGuard.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.BlackGuard,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.CaveBug.id,
		name: Monsters.CaveBug.name,
		aliases: Monsters.CaveBug.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.CaveBug,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([SpinyHelmetSlayerHelmets]),
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Antidote++(4)', 'Antipoison(4)']]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 10
		},

		superiorName: Monsters.ChasmCrawler.name,
		superiorId: Monsters.ChasmCrawler.id,
		superiorTable: Monsters.ChasmCrawler
	},
	{
		id: Monsters.CaveGoblinGuard.id,
		name: Monsters.CaveGoblinGuard.name,
		aliases: Monsters.CaveGoblinGuard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.CaveGoblinGuard,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 8
	},
	{
		id: Monsters.CaveSlime.id,
		name: Monsters.CaveSlime.name,
		aliases: Monsters.CaveSlime.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.CaveSlime,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([
			SpinyHelmetSlayerHelmets,
			['Antidote++(4)', 'Antipoison(4)']
		]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {
			slayer: 17
		},
		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.ChaosDwarf.id,
		name: Monsters.ChaosDwarf.name,
		aliases: Monsters.ChaosDwarf.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.ChaosDwarf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Chicken.id,
		name: Monsters.Chicken.name,
		aliases: Monsters.Chicken.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Chicken,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 50
	},
	{
		id: Monsters.ChompyBird.id,
		name: Monsters.ChompyBird.name,
		aliases: Monsters.ChompyBird.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.ChompyBird,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([['Ogre bow', 'Comp ogre bow']]),
		qpRequired: 3
	},
	{
		id: Monsters.Cow.id,
		name: Monsters.Cow.name,
		aliases: Monsters.Cow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Cow,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 40
	},
	{
		id: Monsters.CowCalf.id,
		name: Monsters.CowCalf.name,
		aliases: Monsters.CowCalf.aliases,
		timeToFinish: Time.Second * 4,
		table: Monsters.CowCalf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 30
	},
	{
		id: Monsters.CrawlingHand.id,
		name: Monsters.CrawlingHand.name,
		aliases: Monsters.CrawlingHand.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.CrawlingHand,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,
		levelRequirements: {
			slayer: 5
		},

		superiorName: Monsters.CrushingHand.name,
		superiorId: Monsters.CrushingHand.id,
		superiorTable: Monsters.CrushingHand
	},
	{
		id: Monsters.CryptRat.id,
		name: Monsters.CryptRat.name,
		aliases: Monsters.CryptRat.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.CryptRat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 1
	},
	{
		id: Monsters.Deathwing.id,
		name: Monsters.Deathwing.name,
		aliases: Monsters.Deathwing.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Deathwing,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 111,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.DemonicGorilla.id,
		name: Monsters.DemonicGorilla.name,
		aliases: Monsters.DemonicGorilla.aliases,
		timeToFinish: Time.Second * 110,
		table: Monsters.DemonicGorilla,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			'Bandos chestplate',
			["Verac's plateskirt", 'Bandos tassets'],
			['Abyssal whip', 'Dragon scimitar'],
			['Rune crossbow', "Karil's crossbow", 'Armadyl crossbow'],
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		qpRequired: 175,
		itemInBankBoosts: {
			[itemID('Arclight')]: 20
		},
		levelRequirements: {
			slayer: 69
		}
	},
	{
		id: Monsters.DesertLizard.id,
		name: Monsters.DesertLizard.name,
		aliases: Monsters.DesertLizard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.DesertLizard,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems(['Ice cooler']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.DesertWolf.id,
		name: Monsters.DesertWolf.name,
		aliases: Monsters.DesertWolf.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.DesertWolf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Duck.id,
		name: Monsters.Duck.name,
		aliases: Monsters.Duck.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Duck,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 30
	},
	{
		id: Monsters.Duckling.id,
		name: Monsters.Duckling.name,
		aliases: Monsters.Duckling.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Duckling,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 50
	},
	{
		id: Monsters.DungeonRat.id,
		name: Monsters.DungeonRat.name,
		aliases: Monsters.DungeonRat.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.DungeonRat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Dwarf.id,
		name: Monsters.Dwarf.name,
		aliases: Monsters.Dwarf.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.Dwarf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 35
	},
	{
		id: Monsters.DwarfGangMember.id,
		name: Monsters.DwarfGangMember.name,
		aliases: Monsters.DwarfGangMember.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.DwarfGangMember,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Ghost.id,
		name: Monsters.Ghost.name,
		aliases: Monsters.Ghost.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Ghost,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.GiantBat.id,
		name: Monsters.GiantBat.name,
		aliases: Monsters.GiantBat.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.GiantBat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.GiantCryptSpider.id,
		name: Monsters.GiantCryptSpider.name,
		aliases: Monsters.GiantCryptSpider.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.GiantCryptSpider,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 1
	},
	{
		id: Monsters.GiantRat.id,
		name: Monsters.GiantRat.name,
		aliases: Monsters.GiantRat.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.GiantRat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 30
	},
	{
		id: Monsters.GiantSpider.id,
		name: Monsters.GiantSpider.name,
		aliases: Monsters.GiantSpider.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.GiantSpider,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 30
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Goblin,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 20
	},
	{
		id: Monsters.GrizzlyBear.id,
		name: Monsters.GrizzlyBear.name,
		aliases: Monsters.GrizzlyBear.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.GrizzlyBear,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 40
	},
	{
		id: Monsters.GrizzlyBearCub.id,
		name: Monsters.GrizzlyBearCub.name,
		aliases: Monsters.GrizzlyBearCub.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.GrizzlyBearCub,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 20
	},
	{
		id: Monsters.GuardDog.id,
		name: Monsters.GuardDog.name,
		aliases: Monsters.GuardDog.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.GuardDog,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 40
	},
	{
		id: Monsters.Icefiend.id,
		name: Monsters.Icefiend.name,
		aliases: Monsters.Icefiend.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Icefiend,
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 25
	},
	{
		id: Monsters.JungleWolf.id,
		name: Monsters.JungleWolf.name,
		aliases: Monsters.JungleWolf.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.JungleWolf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		}
	},
	{
		id: Monsters.KalphiteGuardian.id,
		name: Monsters.KalphiteGuardian.name,
		aliases: Monsters.KalphiteGuardian.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.KalphiteGuardian,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([['Antidote++(4)', 'Antipoison(4)']]),
		qpRequired: 0,

		cannonballs: 10,
		cannonBoost: 50
	},
	{
		id: Monsters.KalphiteSoldier.id,
		name: Monsters.KalphiteSoldier.name,
		aliases: Monsters.KalphiteSoldier.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.KalphiteSoldier,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Antidote++(4)', 'Antipoison(4)']]),
		qpRequired: 0,

		cannonballs: 5,
		cannonBoost: 50
	},
	{
		id: Monsters.KalphiteWorker.id,
		name: Monsters.KalphiteWorker.name,
		aliases: Monsters.KalphiteWorker.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.KalphiteWorker,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 50
	},
	{
		id: Monsters.KingScorpion.id,
		name: Monsters.KingScorpion.name,
		aliases: Monsters.KingScorpion.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.KingScorpion,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 40
	},
	{
		id: Monsters.Lizard.id,
		name: Monsters.Lizard.name,
		aliases: Monsters.Lizard.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lizard,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems(['Ice cooler']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},

		cannonballs: 2,
		cannonBoost: 25
	},
	{
		id: Monsters.Lobstrosity.id,
		name: Monsters.Lobstrosity.name,
		aliases: Monsters.Lobstrosity.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lobstrosity,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([
			[
				'Merfolk trident',
				'Trident of the seas',
				'Trident of the swamp',
				'Brine sabre',
				'Magic secateurs'
			]
		]),
		qpRequired: 10
	},
	{
		id: Monsters.Minotaur.id,
		name: Monsters.Minotaur.name,
		aliases: Monsters.Minotaur.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.Minotaur,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Monkey.id,
		name: Monsters.Monkey.name,
		aliases: Monsters.Monkey.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Monkey,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 35
	},
	{
		id: Monsters.MonkeyArcher.id,
		name: Monsters.MonkeyArcher.name,
		aliases: Monsters.MonkeyArcher.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.MonkeyArcher,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 20
	},
	{
		id: Monsters.MonkeyGuard.id,
		name: Monsters.MonkeyGuard.name,
		aliases: Monsters.MonkeyGuard.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.MonkeyGuard,
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Penguin.id,
		name: Monsters.Penguin.name,
		aliases: Monsters.Penguin.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Penguin,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 30
	},
	{
		id: Monsters.PitScorpion.id,
		name: Monsters.PitScorpion.name,
		aliases: Monsters.PitScorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.PitScorpion,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 35
	},
	{
		id: Monsters.PoisonScorpion.id,
		name: Monsters.PoisonScorpion.name,
		aliases: Monsters.PoisonScorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.PoisonScorpion,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([['Antidote++(4)', 'Antipoison(4)']]),
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Rat.id,
		name: Monsters.Rat.name,
		aliases: Monsters.Rat.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.Rat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 50
	},
	/*
	{
		id: Monsters.ReanimatedDog.id,
		name: Monsters.ReanimatedDog.name,
		aliases: Monsters.ReanimatedDog.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.ReanimatedDog,
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 40
	},
	{
		id: Monsters.Scorpion.id,
		name: Monsters.Scorpion.name,
		aliases: Monsters.Scorpion.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Scorpion,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 35
	},
	{
		id: Monsters.Seagull.id,
		name: Monsters.Seagull.name,
		aliases: Monsters.Seagull.aliases,
		timeToFinish: Time.Second * 3,
		table: Monsters.Seagull,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 40
	},
	{
		id: Monsters.ShadowSpider.id,
		name: Monsters.ShadowSpider.name,
		aliases: Monsters.ShadowSpider.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.ShadowSpider,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Spectral spirit shield')]: 3
		}
	},
	{
		id: Monsters.Skeleton.id,
		name: Monsters.Skeleton.name,
		aliases: Monsters.Skeleton.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Skeleton,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.SkeletonFremennik.id,
		name: Monsters.SkeletonFremennik.name,
		aliases: Monsters.SkeletonFremennik.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SkeletonFremennik,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 35
	},
	{
		id: Monsters.SkeletonMage.id,
		name: Monsters.SkeletonMage.name,
		aliases: Monsters.SkeletonMage.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SkeletonMage,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 35
	},
	{
		id: Monsters.Skogre.id,
		name: Monsters.Skogre.name,
		aliases: Monsters.Skogre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Skogre,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems(['Comp ogre bow', 'Sanfew serum(4)']),
		qpRequired: 5
	},
	{
		id: Monsters.SmallLizard.id,
		name: Monsters.SmallLizard.name,
		aliases: Monsters.SmallLizard.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.SmallLizard,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems(['Ice cooler']),
		qpRequired: 0,
		levelRequirements: {
			slayer: 22
		},

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.Spider.id,
		name: Monsters.Spider.name,
		aliases: Monsters.Spider.aliases,
		timeToFinish: Time.Second * 5,
		table: Monsters.Spider,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 1,
		cannonBoost: 40
	},
	{
		id: Monsters.SulphurLizard.id,
		name: Monsters.SulphurLizard.name,
		aliases: Monsters.SulphurLizard.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.SulphurLizard,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots']
		]),
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
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.TorturedGorilla.id,
		name: Monsters.TorturedGorilla.name,
		aliases: Monsters.TorturedGorilla.aliases,
		timeToFinish: Time.Second * 70,
		table: Monsters.TorturedGorilla,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			'Bandos chestplate',
			["Verac's plateskirt", 'Bandos tassets'],
			['Abyssal whip', 'Dragon scimitar']
		]),
		qpRequired: 175,
		itemInBankBoosts: {
			[itemID('Arclight')]: 20
		},
		levelRequirements: {
			slayer: 69
		}
	},
	{
		id: Monsters.TorturedSoul.id,
		name: Monsters.TorturedSoul.name,
		aliases: Monsters.TorturedSoul.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.TorturedSoul,
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Earmuffs', 'Slayer helmet']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 15
		},

		superiorName: Monsters.ScreamingTwistedBanshee.name,
		superiorId: Monsters.ScreamingTwistedBanshee.id,
		superiorTable: Monsters.ScreamingTwistedBanshee
	},
	{
		id: Monsters.UndeadChicken.id,
		name: Monsters.UndeadChicken.name,
		aliases: Monsters.UndeadChicken.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.UndeadChicken,
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 30
	},
	{
		id: Monsters.WildDog.id,
		name: Monsters.WildDog.name,
		aliases: Monsters.WildDog.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.WildDog,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 3,
		cannonBoost: 30
	},
	{
		id: Monsters.Wolf.id,
		name: Monsters.Wolf.name,
		aliases: Monsters.Wolf.aliases,
		timeToFinish: Time.Second * 7,
		table: Monsters.Wolf,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 40
	},
	{
		id: Monsters.Zogre.id,
		name: Monsters.Zogre.name,
		aliases: Monsters.Zogre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Zogre,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems(['Comp ogre bow', 'Sanfew serum (4)']),
		qpRequired: 5
	},
	{
		id: Monsters.Zombie.id,
		name: Monsters.Zombie.name,
		aliases: Monsters.Zombie.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.Zombie,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0,

		cannonballs: 2,
		cannonBoost: 30
	},
	{
		id: Monsters.ZombieRat.id,
		name: Monsters.ZombieRat.name,
		aliases: Monsters.ZombieRat.aliases,
		timeToFinish: Time.Second * 8,
		table: Monsters.ZombieRat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 32
	}
];

export default TuraelMonsters;
