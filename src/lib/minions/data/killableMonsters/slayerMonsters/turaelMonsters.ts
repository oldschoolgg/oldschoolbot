import { Monsters } from 'oldschooljs';
import { KillableMonster } from '../../../types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
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
		itemsRequired: deepResolveItems([['Earmuffs', 'Slayer helmet']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 6
		},
		levelRequirements: {
			slayer: 15
		}
	},
	{
		id: Monsters.Bat.id,
		name: Monsters.Bat.name,
		aliases: Monsters.Bat.aliases,
		timeToFinish: Time.Second * 4,
		table: Monsters.Bat,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 6
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: deepResolveItems([['Spiny helmet', 'Slayer helmet']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {
			slayer: 10
		}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 8,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: deepResolveItems([['Spiny helmet', 'Slayer helmet']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 3,
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {
			slayer: 5
		}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 111,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.DemonicGorilla.id,
		name: Monsters.DemonicGorilla.name,
		aliases: Monsters.DemonicGorilla.aliases,
		timeToFinish: Time.Second * 90,
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
		notifyDrops: resolveItems([]),
		qpRequired: 175,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 15,
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {
			slayer: 22
		}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
	},
	{
		id: Monsters.GrizzlyBear.id,
		name: Monsters.GrizzlyBear.name,
		aliases: Monsters.GrizzlyBear.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.GrizzlyBear,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10,
			[itemID('Keris')]: 5
		},
		levelRequirements: {}
	},
	{
		id: Monsters.KalphiteSoldier.id,
		name: Monsters.KalphiteSoldier.name,
		aliases: Monsters.KalphiteSoldier.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.KalphiteSoldier,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Antidote++(4)', 'Antipoison(4)']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10,
			[itemID('Keris')]: 5
		},
		levelRequirements: {}
	},
	{
		id: Monsters.KalphiteWorker.id,
		name: Monsters.KalphiteWorker.name,
		aliases: Monsters.KalphiteWorker.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.KalphiteWorker,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10,
			[itemID('Keris')]: 5
		},
		levelRequirements: {}
	},
	{
		id: Monsters.KingScorpion.id,
		name: Monsters.KingScorpion.name,
		aliases: Monsters.KingScorpion.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.KingScorpion,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
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
		notifyDrops: resolveItems([]),
		qpRequired: 10,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 20,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 20,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 20,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 7
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
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
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5,
			[itemID('Spectral spirit shield')]: 3
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 5,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
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
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 175,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 15,
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			slayer: 15
		}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 7
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 2
		},
		levelRequirements: {}
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
		notifyDrops: resolveItems([]),
		qpRequired: 5,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {}
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 32,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 1
		},
		levelRequirements: {}
	}
];

export default TuraelMonsters;
