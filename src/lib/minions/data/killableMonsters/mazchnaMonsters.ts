import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';

export const mazchnaMonsters: KillableMonster[] = [
	{
		id: Monsters.AsynShade.id,
		name: Monsters.AsynShade.name,
		aliases: Monsters.AsynShade.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.AsynShade,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 4
	},
	{
		id: Monsters.Catablepon.id,
		name: Monsters.Catablepon.name,
		aliases: Monsters.Catablepon.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Catablepon,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Cockatrice.id,
		name: Monsters.Cockatrice.name,
		aliases: Monsters.Cockatrice.aliases,
		timeToFinish: Time.Second * 14,
		table: Monsters.Cockatrice,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Mirror shield', "V's shield"]]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 25
		},

		superior: Monsters.Cockathrice
	},
	{
		id: Monsters.Cyclops.id,
		name: Monsters.Cyclops.name,
		aliases: Monsters.Cyclops.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.Cyclops,
		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.EarthWarrior.id,
		name: Monsters.EarthWarrior.name,
		aliases: Monsters.EarthWarrior.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.EarthWarrior,
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0,
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
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Ghoul.id,
		name: Monsters.Ghoul.name,
		aliases: Monsters.Ghoul.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Ghoul,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 1
	},
	{
		id: Monsters.HillGiant.id,
		name: Monsters.HillGiant.name,
		aliases: Monsters.HillGiant.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.HillGiant,
		wildy: false,
		canBeKilled: true,
		existsInCatacombs: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.Hobgoblin.id,
		name: Monsters.Hobgoblin.name,
		aliases: Monsters.Hobgoblin.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.Hobgoblin,
		wildy: true,
		canBeKilled: true,
		difficultyRating: 1,
		qpRequired: 0
	},
	{
		id: Monsters.IceWarrior.id,
		name: Monsters.IceWarrior.name,
		aliases: Monsters.IceWarrior.aliases,
		timeToFinish: Time.Second * 28,
		table: Monsters.IceWarrior,
		wildy: true,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 0
	},
	{
		id: Monsters.Killerwatt.id,
		name: Monsters.Killerwatt.name,
		aliases: Monsters.Killerwatt.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Killerwatt,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 1,
		itemsRequired: resolveItems(['Insulated boots']),
		qpRequired: 4,
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
		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems(['Fishing explosive']),
		qpRequired: 10,
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

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 4
	},
	{
		id: Monsters.Pyrefiend.id,
		name: Monsters.Pyrefiend.name,
		aliases: Monsters.Pyrefiend.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.Pyrefiend,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems(["Black d'hide body", "Black d'hide chaps"]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 30
		},
		superior: Monsters.FlamingPyrelord
	},
	{
		id: Monsters.RiylShade.id,
		name: Monsters.RiylShade.name,
		aliases: Monsters.RiylShade.aliases,
		timeToFinish: Time.Second * 27,
		table: Monsters.RiylShade,

		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Bag of salt', 'Brine sabre']]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 20
		},
		superior: Monsters.GiantRockslug
	},
	{
		id: Monsters.Shade.id,
		name: Monsters.Shade.name,
		aliases: Monsters.Shade.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.Shade,

		wildy: false,
		canBeKilled: true,
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
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([['Ivandis flail', 'Blisterwood flail', 'Dark bow']]),
		qpRequired: 1
	},
	{
		id: Monsters.Vyrewatch.id,
		name: Monsters.Vyrewatch.name,
		aliases: Monsters.Vyrewatch.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.Vyrewatch,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([['Ivandis flail', 'Blisterwood flail', 'Dark bow']]),
		qpRequired: 0
	},
	{
		id: Monsters.VyrewatchSentinel.id,
		name: Monsters.VyrewatchSentinel.name,
		aliases: Monsters.VyrewatchSentinel.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.VyrewatchSentinel,

		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([['Ivandis flail', 'Blisterwood flail', 'Dark bow']]),
		notifyDrops: resolveItems(['Blood shard']),
		qpRequired: 0
	},
	{
		id: Monsters.WallBeast.id,
		name: Monsters.WallBeast.name,
		aliases: Monsters.WallBeast.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.WallBeast,
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([['Spiny helmet', 'Slayer helmet']]),
		qpRequired: 0,
		levelRequirements: {
			slayer: 35
		}
	}
];
