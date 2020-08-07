import { Monsters } from 'oldschooljs';
import { KillableMonster } from '../../../types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
// import { GearSetupTypes, GearStat } from '../../../../gear/types';

const MazchnaMonsters: KillableMonster[] = [
	{
		id: Monsters.AsynShade.id,
		name: Monsters.AsynShade.name,
		aliases: Monsters.AsynShade.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.AsynShade,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Catablepon.id,
		name: Monsters.Catablepon.name,
		aliases: Monsters.Catablepon.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Catablepon,
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
		id: Monsters.Cockatrice.id,
		name: Monsters.Cockatrice.name,
		aliases: Monsters.Cockatrice.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Cockatrice,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Mirror shield', "V's shield"]]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {
			slayer: 25
		},
		superiorTable: Monsters.Cockathrice
	},
	{
		id: Monsters.Cyclopse.id,
		name: Monsters.Cyclopse.name,
		aliases: Monsters.Cyclopse.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.Cyclopse,
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
		id: Monsters.EarthWarrior.id,
		name: Monsters.EarthWarrior.name,
		aliases: Monsters.EarthWarrior.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.EarthWarrior,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {
			agility: 15
		}
	},
	{
		id: Monsters.FeralVampyre.id,
		name: Monsters.FeralVampyre.name,
		aliases: Monsters.FeralVampyre.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.FeralVampyre,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {}
	},
	{
		id: Monsters.FiyrShade.id,
		name: Monsters.FiyrShade.name,
		aliases: Monsters.FiyrShade.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.FiyrShade,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.FleshCrawler.id,
		name: Monsters.FleshCrawler.name,
		aliases: Monsters.FleshCrawler.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.FleshCrawler,
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
		id: Monsters.Ghoul.id,
		name: Monsters.Ghoul.name,
		aliases: Monsters.Ghoul.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Ghoul,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 6
		},
		levelRequirements: {}
	},
	{
		id: Monsters.HillGiant.id,
		name: Monsters.HillGiant.name,
		aliases: Monsters.HillGiant.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.HillGiant,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Hobgoblin.id,
		name: Monsters.Hobgoblin.name,
		aliases: Monsters.Hobgoblin.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.Hobgoblin,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {}
	},
	{
		id: Monsters.IceWarrior.id,
		name: Monsters.IceWarrior.name,
		aliases: Monsters.IceWarrior.aliases,
		timeToFinish: Time.Second * 28,
		table: Monsters.IceWarrior,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Killerwatt.id,
		name: Monsters.Killerwatt.name,
		aliases: Monsters.Killerwatt.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Killerwatt,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems(['Insulated boots']),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8
		},
		levelRequirements: {
			slayer: 37
		}
	},
	{
		id: Monsters.LoarShade.id,
		name: Monsters.LoarShade.name,
		aliases: Monsters.LoarShade.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.LoarShade,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Mogre.id,
		name: Monsters.Mogre.name,
		aliases: Monsters.Mogre.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Mogre,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems(['Fishing explosive']),
		notifyDrops: resolveItems([]),
		qpRequired: 10,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {
			slayer: 32
		}
	},
	{
		id: Monsters.PhrinShade.id,
		name: Monsters.PhrinShade.name,
		aliases: Monsters.PhrinShade.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.PhrinShade,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Pyrefiend.id,
		name: Monsters.Pyrefiend.name,
		aliases: Monsters.Pyrefiend.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.Pyrefiend,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems(["Black d'hide body", "Black d'hide chaps"]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			slayer: 30
		},
		superiorTable: Monsters.FlamingPyrelord
	},
	{
		id: Monsters.Pyrelord.id,
		name: Monsters.Pyrelord.name,
		aliases: Monsters.Pyrelord.aliases,
		timeToFinish: Time.Second * 46,
		table: Monsters.Pyrelord,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems(["Black d'hide body", "Black d'hide chaps"]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			slayer: 30
		},
		superiorTable: Monsters.InfernalPyrelord
	},
	{
		id: Monsters.RiylShade.id,
		name: Monsters.RiylShade.name,
		aliases: Monsters.RiylShade.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.RiylShade,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Rockslug.id,
		name: Monsters.Rockslug.name,
		aliases: Monsters.Rockslug.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Rockslug,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Bag of salt', 'Brine sabre']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 7
		},
		levelRequirements: {
			slayer: 20
		},
		superiorTable: Monsters.GiantRockslug
	},
	{
		id: Monsters.Shade.id,
		name: Monsters.Shade.name,
		aliases: Monsters.Shade.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.Shade,
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
		id: Monsters.VampyreJuvinate.id,
		name: Monsters.VampyreJuvinate.name,
		aliases: Monsters.VampyreJuvinate.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.VampyreJuvinate,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 1,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 7
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Vyrewatch.id,
		name: Monsters.Vyrewatch.name,
		aliases: Monsters.Vyrewatch.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Vyrewatch,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([['Ivandis flail', 'Blisterwood flail', 'Dark bow']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.VyrewatchSentinel.id,
		name: Monsters.VyrewatchSentinel.name,
		aliases: Monsters.VyrewatchSentinel.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.VyrewatchSentinel,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([['Ivandis flail', 'Blisterwood flail', 'Dark bow']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 13
		},
		levelRequirements: {}
	},
	{
		id: Monsters.WallBeast.id,
		name: Monsters.WallBeast.name,
		aliases: Monsters.WallBeast.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.WallBeast,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([['Spiny helmet', 'Slayer helmet']]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			slayer: 35
		}
	}
];

export default MazchnaMonsters;
