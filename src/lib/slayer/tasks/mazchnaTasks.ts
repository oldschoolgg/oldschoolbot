import { Monsters } from 'oldschooljs';

import { AssignableSlayerTask } from '../types';

export const mazchnaTasks: AssignableSlayerTask[] = [
	{
		name: 'Banshee',
		amount: [40, 70],
		weight: 8,
		alternatives: ['Twisted Banshee'],
		id: [Monsters.Banshee.id, Monsters.TwistedBanshee.id],
		combatLevel: 20,
		slayerLevel: 15,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Bat',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Giant bat', 'Deathwing'],
		id: [Monsters.Bat.id, Monsters.GiantBat.id],
		combatLevel: 5,
		unlocked: true
	},
	{
		name: 'Black bear',
		amount: [40, 70],
		weight: 6,
		alternatives: ['Grizzly bear cub', 'Bear cub', 'Grizzly bear', 'Callisto'],
		id: [
			Monsters.BlackBear.id,
			Monsters.GrizzlyBearCub.id,
			Monsters.BearCub.id,
			Monsters.GrizzlyBear.id,
			Monsters.Callisto.id
		],
		combatLevel: 13,
		unlocked: true
	},
	{
		name: 'Catablepon',
		amount: [20, 30],
		weight: 8,
		id: [Monsters.Catablepon.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		name: 'Cave bug',
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveBug.id],
		slayerLevel: 7,
		unlocked: true
	},
	{
		name: 'Cave crawler',
		amount: [40, 70],
		weight: 8,
		id: [Monsters.CaveCrawler.id],
		combatLevel: 10,
		slayerLevel: 10,
		unlocked: true
	},
	{
		name: 'Cave slime',
		amount: [10, 20],
		weight: 8,
		id: [Monsters.CaveSlime.id],
		combatLevel: 15,
		slayerLevel: 17,
		unlocked: true
	},
	{
		name: 'Cockatrice',
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Cockatrice.id],
		combatLevel: 25,
		slayerLevel: 25,
		unlocked: true
	},
	{
		name: 'Crawling hand',
		amount: [40, 70],
		weight: 8,
		id: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Lizard',
		amount: [40, 70],
		weight: 8,
		alternatives: ['Small Lizard', 'Desert Lizard', 'Sulphur Lizard'],
		id: [
			Monsters.Lizard.id,
			Monsters.SmallLizard.id,
			Monsters.DesertLizard.id,
			Monsters.SulphurLizard.id
		],
		slayerLevel: 22,
		unlocked: true
	},
	{
		name: 'Guard dog',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Jackal', 'Wild dog'],
		id: [Monsters.GuardDog.id, Monsters.Jackal.id, Monsters.WildDog.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		name: 'Earth warrior',
		amount: [40, 70],
		weight: 6,
		id: [Monsters.EarthWarrior.id],
		combatLevel: 35,
		unlocked: true
	},
	{
		name: 'Flesh Crawler',
		amount: [15, 25],
		weight: 7,
		id: [Monsters.FleshCrawler.id],
		combatLevel: 15,
		unlocked: true
	},
	{
		name: 'Ghost',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Tortured soul'],
		id: [Monsters.Ghost.id, Monsters.TorturedSoul.id],
		combatLevel: 13,
		unlocked: true
	},
	{
		name: 'Ghoul',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.Ghoul.id],
		combatLevel: 25,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Hill Giant',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Obor', 'Cyclops'],
		id: [Monsters.HillGiant.id, Monsters.Obor.id, Monsters.Cyclops.id],
		combatLevel: 25,
		unlocked: true
	},
	{
		name: 'Hobgoblin',
		amount: [40, 70],
		weight: 7,
		id: [Monsters.Hobgoblin.id],
		combatLevel: 20,
		unlocked: true
	},
	{
		name: 'Ice warrior',
		amount: [40, 70],
		weight: 7,
		id: [Monsters.IceWarrior.id],
		combatLevel: 45,
		unlocked: true
	},
	{
		name: 'Kalphite worker',
		amount: [40, 70],
		weight: 6,
		alternatives: ['Kalphite soldier', 'Kalphite guardian', 'Kalphite Queen'],
		id: [
			Monsters.KalphiteWorker.id,
			Monsters.KalphiteSoldier.id,
			Monsters.KalphiteGuardian.id,
			Monsters.KalphiteQueen.id
		],
		combatLevel: 15,
		unlocked: true
	},
	{
		name: 'Killerwatt',
		amount: [30, 80],
		weight: 6,
		id: [Monsters.Killerwatt.id],
		combatLevel: 50,
		slayerLevel: 37,
		questPoints: 4,
		unlocked: true
	},
	{
		name: 'Mogre',
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Mogre.id],
		combatLevel: 30,
		slayerLevel: 32,
		unlocked: true
	},
	{
		name: 'Pyrefiend',
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Pyrefiend.id],
		combatLevel: 25,
		slayerLevel: 30,
		unlocked: true
	},
	{
		name: 'Rockslug',
		amount: [40, 70],
		weight: 8,
		id: [Monsters.Rockslug.id],
		combatLevel: 20,
		slayerLevel: 20,
		unlocked: true
	},
	{
		name: 'Scorpion',
		amount: [40, 70],
		weight: 7,
		alternatives: [
			'King Scorpion',
			'Poison Scorpion',
			'Pit Scorpion',
			'Scorpia',
			'Lobstrosity'
		],
		id: [
			Monsters.Scorpion.id,
			Monsters.KingScorpion.id,
			Monsters.PoisonScorpion.id,
			Monsters.PitScorpion.id,
			Monsters.Scorpia.id,
			Monsters.Lobstrosity.id
		],
		combatLevel: 7,
		unlocked: true
	},
	{
		name: 'Shade',
		amount: [40, 70],
		weight: 8,
		alternatives: ['Loar Shade', 'Phrin Shade', 'Riyl Shade', 'Asyn Shade', 'Fiyr Shade'],
		id: [
			Monsters.Shade.id,
			Monsters.LoarShade.id,
			Monsters.PhrinShade.id,
			Monsters.RiylShade.id,
			Monsters.AsynShade.id,
			Monsters.FiyrShade.id
		],
		combatLevel: 30,
		unlocked: true
	},
	{
		name: 'Skeleton',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Skeleton mage', "Vet'ion", 'Skogre', 'Skeleton fremennik'],
		id: [
			Monsters.SkeletonMage.id,
			Monsters.Vetion.id,
			Monsters.Skogre.id,
			Monsters.SkeletonFremennik.id
		],
		combatLevel: 15,
		unlocked: true
	},
	{
		name: 'Feral Vampyre',
		amount: [10, 20],
		weight: 6,
		alternatives: ['Vampyre Juvinate', 'Vyrewatch', 'Vyrewatch Sentinel'],
		id: [
			Monsters.FeralVampyre.id,
			Monsters.VampyreJuvinate.id,
			Monsters.Vyrewatch.id,
			Monsters.VyrewatchSentinel.id
		],
		combatLevel: 35,
		questPoints: 1,
		unlocked: true
	},
	{
		name: 'Wall beast',
		amount: [10, 20],
		weight: 7,
		id: [Monsters.WallBeast.id],
		combatLevel: 30,
		slayerLevel: 35,
		unlocked: true
	},
	{
		name: 'Wolf',
		amount: [40, 70],
		weight: 7,
		alternatives: ['Big Wolf', 'Desert Wolf', 'Ice wolf', 'Jungle wolf', 'White wolf'],
		id: [
			Monsters.Wolf.id,
			Monsters.BigWolf.id,
			Monsters.DesertWolf.id,
			Monsters.IceWolf.id,
			Monsters.JungleWolf.id,
			Monsters.WhiteWolf.id
		],
		combatLevel: 20,
		unlocked: true
	},
	{
		name: 'Zombie',
		amount: [40, 70],
		weight: 7,
		alternatives: [
			'Monkey Zombie',
			'Undead chicken',
			'Undead cow',
			'Undead Druid',
			'Undead one',
			'Zombie rat',
			'Zogre',
			'Vorkath'
		],
		id: [
			Monsters.Zombie.id,
			Monsters.MonkeyZombie.id,
			Monsters.UndeadChicken.id,
			Monsters.UndeadCow.id,
			Monsters.UndeadDruid.id,
			Monsters.UndeadOne.id,
			Monsters.ZombieRat.id,
			Monsters.Zogre.id,
			Monsters.Vorkath.id
		],
		combatLevel: 10,
		unlocked: true
	}
];
